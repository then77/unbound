import {
    generateRandomString,
    generateJWKPair,
} from "@unbound/server/utils/generate";

import type { Context } from "hono";
import type { JWK } from "jose";
import type { AppEnv } from "@unbound/server/server";
import type { Env as UnboundEnv, SigningAlgorithm } from "@unbound/types";
import type { JSONObject } from "hono/utils/types";

type CheckConfigResult = {
    missing: (keyof UnboundEnv)[];
    errors: Partial<Record<keyof UnboundEnv, string>>;
    defaults: Partial<Record<keyof UnboundEnv, string>>;
};

export type JWKWithKid = JSONObject & JWK & { kid: string };

let cachedConfigResult: CheckConfigResult | null = null;

export function parseJWK(value: string): JWKWithKid | null {
    try {
        const parsed: unknown = JSON.parse(value);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return null;
        }

        return parsed as JWKWithKid;
    } catch {
        return null;
    }
}

export function validatePair(publicJwk: JWKWithKid, privateJwk: JWKWithKid) {
    function hasPairedKeys(keys: string[]) {
        return keys.every(
            (key) =>
                key in publicJwk &&
                key in privateJwk &&
                publicJwk[key] === privateJwk[key],
        );
    }

    if (!("kty" in publicJwk) || !("kty" in privateJwk)) return false;
    if (publicJwk.kty !== privateJwk.kty) return false;

    switch (publicJwk.kty) {
        case "RSA":
            return hasPairedKeys(["n", "e", "kid"]);
        case "EC":
            return hasPairedKeys(["x", "y", "kid"]);
        case "OKP":
            return hasPairedKeys(["x", "kid"]);
        default:
            return false;
    }
}

export function getJwkAlgorithm(jwk: JWK): SigningAlgorithm | null {
    if (jwk.alg && typeof jwk.alg === "string") {
        return jwk.alg as SigningAlgorithm;
    }

    switch (jwk.kty) {
        case "OKP":
            switch (jwk.crv) {
                case "Ed25519":
                case "Ed448":
                    return "EdDSA";
            }
            break;

        case "EC":
            switch (jwk.crv) {
                case "P-256":
                    return "ES256";

                case "P-384":
                    return "ES384";

                case "P-521":
                    return "ES512";
            }
            break;

        case "RSA":
            return "RS256";
    }

    return null;
}

export async function checkEnvConfiguration(
    c: Context<AppEnv>,
): Promise<CheckConfigResult> {
    if (cachedConfigResult) return cachedConfigResult;

    const result: CheckConfigResult = { missing: [], errors: {}, defaults: {} };
    function missing(missing: keyof UnboundEnv, defaultValue?: string) {
        result.missing.push(missing);
        if (defaultValue) result.defaults[missing] = defaultValue;
    }
    function errors(
        error: keyof UnboundEnv,
        reason: string,
        defaultValue?: string,
    ) {
        result.errors[error] = reason;
        if (defaultValue) result.defaults[error] = defaultValue;
    }

    if (!c.env.SESSION_SECRET_KEY || c.env.SESSION_SECRET_KEY == "")
        missing("SESSION_SECRET_KEY", generateRandomString());

    if (
        !c.env.JWK_PRIVATE_KEY ||
        !c.env.JWK_PUBLIC_KEY ||
        c.env.JWK_PRIVATE_KEY == "" ||
        c.env.JWK_PUBLIC_KEY == ""
    ) {
        const jwks = await generateJWKPair();
        missing("JWK_PRIVATE_KEY", JSON.stringify(jwks.private));
        missing("JWK_PUBLIC_KEY", JSON.stringify(jwks.public));
    }

    // Checks for missing jwk pair config, and validate
    if (c.env.JWK_PRIVATE_KEY && c.env.JWK_PUBLIC_KEY) {
        const privateJwk = c.env.JWK_PRIVATE_KEY
            ? parseJWK(c.env.JWK_PRIVATE_KEY)
            : null;
        const publicJwk = c.env.JWK_PUBLIC_KEY
            ? parseJWK(c.env.JWK_PUBLIC_KEY)
            : null;

        let jwkError: string | null = null;
        if (!privateJwk || !publicJwk) {
            jwkError = "JWK pair can't be parsed.";
        } else if (!validatePair(publicJwk, privateJwk)) {
            jwkError = "JWK pair mismatched.";
        }

        if (jwkError) {
            const jwks = await generateJWKPair();
            errors("JWK_PRIVATE_KEY", jwkError, JSON.stringify(jwks.private));
            errors("JWK_PUBLIC_KEY", jwkError, JSON.stringify(jwks.public));
        }

        if (!jwkError) {
            const privateJwkAlg = getJwkAlgorithm(privateJwk!);
            const publicJwkAlg = getJwkAlgorithm(publicJwk!);
            if (!privateJwkAlg)
                errors(
                    "JWK_PRIVATE_KEY",
                    "Private JWK algorithm can't be determined.",
                );
            if (!publicJwkAlg)
                errors(
                    "JWK_PUBLIC_KEY",
                    "Public JWK algorithm can't be determined.",
                );
            if (privateJwkAlg != publicJwkAlg) {
                jwkError = "JWK algorithm mismatched.";
                errors("JWK_PRIVATE_KEY", jwkError);
                errors("JWK_PUBLIC_KEY", jwkError);
            }
        }
    }

    // Checks missing pair of oauth client config
    const providers: [string, keyof UnboundEnv, keyof UnboundEnv][] = [
        ["Google", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
        ["GitHub", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
        ["Discord", "DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"],
    ];
    const oauthMissing = (x: string) =>
        `${x} auth requires both client id and secret to work.`;

    for (const [name, idKey, secretKey] of providers) {
        const hasId = !!c.env[idKey];
        const hasSecret = !!c.env[secretKey];

        if (hasId !== hasSecret) {
            const missingKey = hasId ? secretKey : idKey;
            missing(missingKey);
            errors(hasId ? idKey : secretKey, oauthMissing(name));
        }
    }

    if (c.env.CLOUDFLARE_KV_NAMESPACE_ID) {
        const kvMissing =
            "Cloudflare kv config requires both account id and token to work.";
        const checks: (keyof UnboundEnv)[] = [
            "CLOUDFLARE_ACCOUNT_ID",
            "CLOUDFLARE_API_TOKEN",
        ];

        for (const check of checks) {
            if (!c.env[check]) {
                missing(check);
                errors(check, kvMissing);
            }
        }
    }

    cachedConfigResult = result;
    return result;
}
