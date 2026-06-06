import {
    generateRandomString,
    generateJWKPair,
} from "@unbound/server/utils/generate";

import type { Context } from "hono";
import type { AppEnv } from "@unbound/server/server";
import type { Env, SigningAlgorithm } from "@unbound/types";

type CheckConfigResult = {
    missing: (keyof Env)[];
    errors: Partial<Record<keyof Env, string>>;
    defaults: Partial<Record<keyof Env, string>>;
};

type JsonObject = Record<string, unknown>;

let cachedConfigResult: CheckConfigResult | null = null;

export function parseJsonObject(value: string): JsonObject | null {
    try {
        const parsed: unknown = JSON.parse(value);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return null;
        }

        return parsed as JsonObject;
    } catch {
        return null;
    }
}

export function validatePair(publicJwk: JsonObject, privateJwk: JsonObject) {
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
            return hasPairedKeys(["n", "e"]);
        case "EC":
            return hasPairedKeys(["x", "y"]);
        case "OKP":
            return hasPairedKeys(["x"]);
        default:
            return false;
    }
}

export function getJwkAlgorithm(jwk: JsonObject): SigningAlgorithm | null {
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
    function missing(missing: keyof Env, defaultValue?: string) {
        result.missing.push(missing);
        if (defaultValue) result.defaults[missing] = defaultValue;
    }
    function errors(error: keyof Env, reason: string, defaultValue?: string) {
        result.errors[error] = reason;
        if (defaultValue) result.defaults[error] = defaultValue;
    }

    if (!c.env.SESSION_SECRET_KEY)
        missing("SESSION_SECRET_KEY", generateRandomString());

    if (!c.env.JWK_PRIVATE_KEY || !c.env.JWK_PUBLIC_KEY) {
        const jwks = await generateJWKPair();
        missing("JWK_PRIVATE_KEY", JSON.stringify(jwks.private));
        missing("JWK_PUBLIC_KEY", JSON.stringify(jwks.public));
    }

    if (c.env.JWK_PRIVATE_KEY && c.env.JWK_PUBLIC_KEY) {
        const privateJwk = c.env.JWK_PRIVATE_KEY
            ? parseJsonObject(c.env.JWK_PRIVATE_KEY)
            : null;
        const publicJwk = c.env.JWK_PUBLIC_KEY
            ? parseJsonObject(c.env.JWK_PUBLIC_KEY)
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
            if (!getJwkAlgorithm(privateJwk!))
                errors(
                    "JWK_PRIVATE_KEY",
                    "Private JWK algorithm can't be determined.",
                );
            if (!getJwkAlgorithm(publicJwk!))
                errors(
                    "JWK_PUBLIC_KEY",
                    "Public JWK algorithm can't be determined.",
                );
        }
    }

    cachedConfigResult = result;
    return result;
}
