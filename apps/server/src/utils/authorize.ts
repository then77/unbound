import Iron from "@hapi/iron";
import { errors, importJWK, jwtVerify, SignJWT } from "jose";

import { getJwkAlgorithm, parseJWK } from "@unbound/server/utils/config";
import {
    generateHash,
    generateRandomString,
} from "@unbound/server/utils/generate";

import type { Context } from "hono";
import type { AppEnv } from "@unbound/server/server";
import type { Session } from "@unbound/types";
import AuthorizeError from "@unbound/server/exceptions/authorize";

const ALLOWED_SCOPES = ["openid", "profile", "email"] as const;
const DEFAULT_AUTHORIZE_TTL_SECONDS = 120;
const DEFAULT_AUTHORIZE_KV_TTL_SECONDS = 600;
const DEFAULT_TOKEN_TTL_SECONDS = 900;

// Must match bits in iron encrypt/decrypt options. formula: bits => bytes: (x / 8)
const PACKED_SALT_BYTES = 16; // 128 bits
const PACKED_IV_BYTES = 16; // 128 bits

type AuthResultUser = Pick<
    Session,
    "sub" | "name" | "picture" | "email" | "email_verified"
>;
type AuthResultData = {
    client_id: string;
    redirect_uri: string;
    scope: string[];
    code_challenge?: string | null;
    code_challenge_method?: string | null;
    nonce?: string | null;
};
type AuthResultDataDecoded = Omit<AuthResultData, "scope"> & {
    scope: (typeof ALLOWED_SCOPES)[number][];
};

function getAuthorizeTtl(value: string | null | undefined) {
    const ttlSeconds = value ? Number(value) : DEFAULT_AUTHORIZE_TTL_SECONDS;

    return Number.isFinite(ttlSeconds) && ttlSeconds > 0
        ? ttlSeconds
        : DEFAULT_AUTHORIZE_TTL_SECONDS;
}

export function getAuthorizeKVTtl(value: string | null | undefined) {
    const ttlSeconds = value ? Number(value) : DEFAULT_AUTHORIZE_KV_TTL_SECONDS;

    return Number.isFinite(ttlSeconds) && ttlSeconds > 0
        ? ttlSeconds
        : DEFAULT_AUTHORIZE_KV_TTL_SECONDS;
}

function getTokenTtl(value: string | null | undefined) {
    const ttlSeconds = value ? Number(value) : DEFAULT_TOKEN_TTL_SECONDS;

    return Number.isFinite(ttlSeconds) && ttlSeconds > 0
        ? ttlSeconds
        : DEFAULT_TOKEN_TTL_SECONDS;
}

function bitsToScopes(bits: number) {
    return ALLOWED_SCOPES.filter((_, i) => (bits & (1 << i)) !== 0);
}

function scopesToBits(scopes: AuthResultData["scope"]) {
    return scopes.reduce((result, scope) => {
        const index = ALLOWED_SCOPES.indexOf(
            scope as (typeof ALLOWED_SCOPES)[number],
        );

        if (index === -1) {
            throw new Error(`Invalid scope: ${scope}`);
        }

        return result | (1 << index);
    }, 0);
}

export async function createAuthCode(
    c: Context<AppEnv>,
    user: AuthResultUser,
    data: AuthResultData,
) {
    const { scope, client_id } = data;

    // client_id check match redirect_uri origin
    const clientOrigin = client_id.slice("origin:".length);
    if (clientOrigin != new URL(data.redirect_uri).origin) {
        throw new Error("Client id does not match with redirect_uri origin.");
    }

    let scopeBits: number;
    try {
        scopeBits = scopesToBits(scope);
    } catch (err) {
        throw new AuthorizeError(
            "ERROR_GENERATE",
            err instanceof Error ? err.message : "Failed to resolve scopes.",
        );
    }
    const pairwiseSub = generateHash(
        [user.sub, clientOrigin, c.env.SESSION_SECRET_KEY].join("|"),
    ).slice(0, 32); // take only first 16 bytes to save length.

    const payload = [
        scopeBits,
        pairwiseSub,
        scope.includes("profile") ? user.name : 0,
        scope.includes("profile") ? user.picture : 0,
        scope.includes("email") ? user.email : 0,
        scope.includes("email") && user.email_verified ? 1 : 0,
        data.redirect_uri,
        data.code_challenge ?? 0,
        data.code_challenge_method ?? 0,
        data.nonce ?? 0,
        Date.now() + (getAuthorizeTtl(c.env.AUTHORIZE_CODE_EXPIRATION) * 1000),
    ].join("|");

    try {
        const {
            key: { salt, iv },
            encrypted,
        } = await Iron.encrypt(
            c.env.SESSION_SECRET_KEY,
            {
                algorithm: "aes-256-cbc",
                iterations: 1,
                minPasswordlength: 32,
                saltBits: 128,
            },
            payload,
        );

        const packed = Buffer.concat([Buffer.from(salt, "hex"), iv, encrypted]);

        return packed.toString("base64url");
    } catch (err) {
        if (err instanceof AuthorizeError) throw err;
        throw new AuthorizeError(
            "ERROR_GENERATE",
            "Failed to generate auth code.",
        );
    }
}

export async function decodeAuthCode(
    c: Context<AppEnv>,
    code: string,
): Promise<{
    user: AuthResultUser;
    data: AuthResultDataDecoded;
    iv: string;
    expiration: number;
}> {
    const buf = Buffer.from(code, "base64url");

    // Split salt, iv, data based on start-end bytes
    const saltBuffer = buf.subarray(0, PACKED_SALT_BYTES);
    const ivBuffer = buf.subarray(
        PACKED_SALT_BYTES,
        PACKED_SALT_BYTES + PACKED_IV_BYTES,
    );
    const encryptedBuffer = buf.subarray(PACKED_SALT_BYTES + PACKED_IV_BYTES);

    let payload: string;
    try {
        payload = await Iron.decrypt(
            c.env.SESSION_SECRET_KEY,
            {
                algorithm: "aes-256-cbc",
                iterations: 1,
                minPasswordlength: 32,
                salt: saltBuffer.toString("hex"),
                iv: ivBuffer,
            },
            encryptedBuffer as unknown as string,
        );
    } catch {
        throw new AuthorizeError(
            "ERROR_DECODE",
            "Failed to decrypt auth code.",
        );
    }

    const [
        scopeBitsStr,
        sub,
        nameOrZero,
        pictureOrZero,
        emailOrZero,
        emailVerifiedStr,
        redirect_uri,
        codeChallengeOrZero,
        codeChallengeMethodOrZero,
        nonceOrZero,
        expirationStr,
    ] = payload.split("|");

    const client_id = "origin:" + new URL(redirect_uri).origin;

    const user: AuthResultUser = {
        sub,
        name: nameOrZero !== "0" ? nameOrZero : undefined,
        picture: pictureOrZero !== "0" ? pictureOrZero : undefined,
        email: emailOrZero !== "0" ? emailOrZero : undefined,
        email_verified: emailVerifiedStr === "1" ? true : undefined,
    };

    const data = {
        client_id,
        redirect_uri,
        scope: bitsToScopes(Number(scopeBitsStr)),
        code_challenge:
            codeChallengeOrZero !== "0" ? codeChallengeOrZero : null,
        code_challenge_method:
            codeChallengeMethodOrZero !== "0"
                ? codeChallengeMethodOrZero
                : null,
        nonce: nonceOrZero !== "0" ? nonceOrZero : null,
    };

    try {
        return {
            user,
            data,
            iv: ivBuffer.toString("base64url"),
            expiration: Number(expirationStr),
        };
    } catch {
        throw new AuthorizeError(
            "ERROR_DECODE",
            "Failed to decode auth code payload.",
        );
    }
}

export async function createSignedJWT(
    c: Context<AppEnv>,
    user: AuthResultUser,
    data: AuthResultData,
) {
    const privateJwk = parseJWK(c.env.JWK_PRIVATE_KEY)!;
    const signingAlg = getJwkAlgorithm(privateJwk)!;

    let signingKey: Awaited<ReturnType<typeof importJWK>>;
    try {
        signingKey = await importJWK(privateJwk, signingAlg);
    } catch {
        throw new AuthorizeError(
            "ERROR_GENERATE",
            "Failed to import signing key.",
        );
    }

    const finalData = {
        sub: user.sub,
        name: user.name ?? undefined,
        picture: user.picture ?? undefined,
        email: user.email ?? undefined,
        email_verified: user.email_verified ?? undefined,
        nonce: data.nonce ?? undefined,
    };

    try {
        const now = Math.floor(Date.now() / 1000);
        const expires_in = getTokenTtl(c.env.AUTHORIZE_TOKEN_EXPIRATION);

        const token = await new SignJWT(finalData)
            .setProtectedHeader({
                alg: signingAlg,
                kid: privateJwk.kid,
            })
            .setIssuer(new URL(c.req.url).origin)
            .setAudience(data.client_id)
            .setIssuedAt(now)
            .setExpirationTime(now + expires_in)
            .setJti(generateRandomString(16))
            .sign(signingKey);

        return { token, expires_in };
    } catch (err) {
        if (err instanceof AuthorizeError) throw err;
        throw new AuthorizeError("ERROR_GENERATE", "Failed to sign JWT.");
    }
}

export async function getJWTAuth(
    c: Context<AppEnv>,
    token: string,
): Promise<AuthResultUser> {
    const publicJwk = parseJWK(c.env.JWK_PUBLIC_KEY)!;
    const signingAlg = getJwkAlgorithm(publicJwk)!;

    const verifyKey = await importJWK(publicJwk, signingAlg);

    let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];
    try {
        ({ payload } = await jwtVerify(token, verifyKey));
    } catch (err) {
        if (err instanceof errors.JWTExpired) {
            throw new AuthorizeError("EXPIRED_TOKEN", "Token has expired.");
        }
        throw new AuthorizeError("INVALID_TOKEN", "Token verification failed.");
    }

    if (!payload.sub) {
        throw new AuthorizeError("INVALID_TOKEN", "Token is missing subject.");
    }

    return {
        sub: payload.sub,
        name: typeof payload["name"] === "string" ? payload["name"] : undefined,
        picture:
            typeof payload["picture"] === "string"
                ? payload["picture"]
                : undefined,
        email:
            typeof payload["email"] === "string" ? payload["email"] : undefined,
        email_verified:
            typeof payload["email_verified"] === "boolean"
                ? payload["email_verified"]
                : undefined,
    };
}
