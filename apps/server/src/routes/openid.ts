import { Hono } from "hono";

import { getJwkAlgorithm, parseJsonObject } from "@unbound/server/utils/config";

import type { AppEnv } from "@unbound/server";
import type { OpenIDConfiguration } from "@unbound/types";

const app = new Hono<AppEnv>().basePath("/.well-known");

app.get("/openid-configuration", async (c) => {
    const url = new URL(c.req.url);
    const publicJwk = parseJsonObject(c.env.JWK_PUBLIC_KEY)!;
    const signingAlg = getJwkAlgorithm(publicJwk)!;

    const config: OpenIDConfiguration = {
        issuer: url.origin,
        authorization_endpoint: `${url.origin}/authorize`,
        token_endpoint: `${url.origin}/token`,
        userinfo_endpoint: `${url.origin}/userinfo`,
        jwks_uri: `${url.origin}/.well-known/jwks.json`,
        response_types_supported: ["code"],
        subject_types_supported: ["pairwise"],
        id_token_signing_alg_values_supported: [signingAlg],
        token_endpoint_auth_methods_supported: ["none"],
        prompt_values_supported: ["consent", "login", "select_account"],
        code_challenge_methods_supported: ["S256"],
        scopes_supported: ["openid", "profile", "email"],
        grant_types_supported: ["authorization_code"],
        claims_supported: [], // TODO
    };

    return c.json(config);
});

app.get("/jwks.json", async (c) => {
    const publicJwk = parseJsonObject(c.env.JWK_PUBLIC_KEY)!;
    return c.json({ keys: [publicJwk] });
});

export default app;
