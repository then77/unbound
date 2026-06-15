import { Hono } from "hono";

import z from "zod";
import {
    pageValidator,
    tokenValidationError,
} from "@unbound/server/utils/validator";

import AuthorizeError from "@unbound/server/exceptions/authorize";

import { AuthorizePage } from "@unbound/web/pages/authorize";

import { getFaviconBase64 } from "@unbound/server/utils";
import { generateHash } from "@unbound/server/utils/generate";
import {
    createAuthCode,
    createSignedJWT,
    decodeAuthCode,
    getAuthorizeKVTtl,
    getJWTAuth,
} from "@unbound/server/utils/authorize";
import { getKV } from "@unbound/server/utils/kv";

import type { AppEnv } from "@unbound/server";

const ALLOWED_SCOPES = ["openid", "profile", "email"] as const;

export const authorizeQuerySchema = z
    .object({
        client_id: z
            .string()
            .regex(
                /^origin:https:\/\/[^/]+$/,
                "client_id must be in the format origin:https://example.com",
            ),

        response_type: z.literal("code"),

        redirect_uri: z.url(),

        scope: z.string().transform((value) => value.trim().split(/\s+/)),

        state: z.string().optional(),

        code_challenge: z
            .string()
            .max(128)
            .regex(
                /^[A-Za-z0-9\-_]+$/,
                "code_challenge must use base64url format",
            )
            .optional(),

        code_challenge_method: z.literal("S256").optional(),

        nonce: z
            .string()
            .regex(/^[A-Za-z0-9\-_]+$/, "nonce must use base64url format")
            .optional(),
    })
    .superRefine((data, ctx) => {
        const scopes = [...new Set(data.scope)];

        for (const scope of scopes) {
            if (!ALLOWED_SCOPES.includes(scope as any)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["scope"],
                    message:
                        "scopes must only contains: openid, profile, email",
                });
            }
        }

        const clientOrigin = data.client_id.slice("origin:".length);
        try {
            const redirectOrigin = new URL(data.redirect_uri).origin;

            if (redirectOrigin !== clientOrigin) {
                ctx.addIssue({
                    code: "custom",
                    path: ["redirect_uri"],
                    message: "redirect_uri origin must match client_id origin",
                });
            }
        } catch {}

        if (data.code_challenge && !data.code_challenge_method) {
            ctx.addIssue({
                code: "custom",
                path: ["code_challenge_method"],
                message:
                    "code_challenge_method is required when code_challenge is provided",
            });
        }
    });

const authorizeFormSchema = z.object({
    result: z.enum(["allow", "deny"]),
});

const tokenFormSchema = z.object({
    grant_type: z.literal("authorization_code"),
    client_id: z.string().min(1),
    redirect_uri: z.url(),
    code: z.string().min(1),
    code_verifier: z.string().min(1).optional(),
});

const app = new Hono<AppEnv>();

app.get(
    "/authorize",
    pageValidator("query", authorizeQuerySchema),
    async (c) => {
        if (!c.get("isLoggedIn")()) {
            const currentUrl = new URL(c.req.url);
            const redirectTo = currentUrl.pathname + currentUrl.search;

            const url = new URL("/login", c.req.url);
            url.searchParams.set("redirect_to", redirectTo);

            return c.redirect(url);
        }

        const { client_id, scope, redirect_uri } = c.req.valid("query");

        const session = c.get("session");

        const clientUrl = client_id.replace("origin:", "");
        const clientIcon = await getFaviconBase64(new URL(clientUrl).origin);
        const cancelUrl = new URL(redirect_uri);
        cancelUrl.searchParams.set("error", "access_denied");

        return c.render(
            <AuthorizePage
                session={session}
                clientId={clientUrl}
                scopes={scope}
                cancelUrl={cancelUrl.toString()}
                clientIcon={clientIcon}
            />,
            { title: `Authorize` },
        );
    },
);

app.post(
    "/authorize",
    pageValidator("query", authorizeQuerySchema, async (_, c) => {
        // Self redirect back to GET /authorize
        return c.redirect(c.req.url);
    }),
    pageValidator("form", authorizeFormSchema, async (_, c) => {
        await c.get("setFlash")({
            id: "login",
            type: "error",
            message: "Invalid authorize parameter. Please try again.",
        });
        return c.redirect(c.req.url);
    }),
    async (c) => {
        if (!c.get("isLoggedIn")()) {
            const currentUrl = new URL(c.req.url);
            const redirectTo = currentUrl.pathname + currentUrl.search;

            const url = new URL("/login", c.req.url);
            url.searchParams.set("redirect_to", redirectTo);

            return c.redirect(url);
        }

        const queries = c.req.valid("query");
        const { result } = c.req.valid("form");
        const redirectUrl = new URL(queries.redirect_uri);

        if (result != "allow") {
            redirectUrl.searchParams.set("error", "access_denied");
            return c.redirect(redirectUrl.toString());
        }

        const session = c.get("session");
        const code = await createAuthCode(c, session!, queries);

        redirectUrl.searchParams.set("code", code);
        if (queries.state) {
            redirectUrl.searchParams.set("state", queries.state);
        }

        return c.redirect(redirectUrl.toString());
    },
);

app.post(
    "/token",
    pageValidator("form", tokenFormSchema, async (result, c) => {
        return c.json(tokenValidationError(result.error.issues, "form"), 400);
    }),
    async (c) => {
        const { client_id, redirect_uri, code, code_verifier } =
            c.req.valid("form");

        let result: Awaited<ReturnType<typeof decodeAuthCode>>;
        try {
            result = await decodeAuthCode(c, code);
        } catch (error) {
            if (error instanceof AuthorizeError) {
                return c.json(
                    {
                        error: "invalid_grant",
                        error_description: "Invalid authorization code",
                    },
                    400,
                );
            }

            throw error;
        }

        if (Date.now() > result.expiration) {
            return c.json(
                {
                    error: "invalid_grant",
                    error_description: "Authorization code expired",
                },
                400,
            );
        }

        if (result.data.client_id != client_id) {
            const message = client_id.startsWith("origin:")
                ? "Client id does not match"
                : 'Client id does not match. Try again with "origin:" prefix';

            return c.json(
                {
                    error: "invalid_grant",
                    error_description: message,
                },
                400,
            );
        }

        if (result.data.redirect_uri != redirect_uri) {
            return c.json(
                {
                    error: "invalid_grant",
                    error_description: "Redirect uri does not match",
                },
                400,
            );
        }

        if (result.data.code_challenge) {
            if (!code_verifier) {
                return c.json(
                    {
                        error: "invalid_grant",
                        error_description:
                            "Code verifier is required for this code",
                    },
                    400,
                );
            }

            if (
                generateHash(code_verifier, "base64url") !=
                result.data.code_challenge
            ) {
                return c.json(
                    {
                        error: "invalid_grant",
                        error_description:
                            "Code verifier does not match code challenge",
                    },
                    400,
                );
            }
        }

        const kv = getKV(c);
        if (kv) {
            const hashedIv = generateHash(result.iv);

            if (await kv.get(`code-record:${hashedIv}`)) {
                return c.json(
                    {
                        error: "invalid_grant",
                        error_description: "Authorization code already used",
                    },
                    400,
                );
            }

            await kv.put(`code-record:${hashedIv}`, result.user.sub!, {
                expirationTtl: getAuthorizeKVTtl(c.env.AUTHORIZE_CODE_KV_TTL),
            });
        }

        const { token, expires_in } = await createSignedJWT(
            c,
            result.user,
            result.data,
        );
        return c.json({
            token_type: "Bearer",
            expires_in,
            access_token: token,
            id_token: result.data.scope.includes("openid") ? token : undefined,
        });
    },
);

app.get("/userinfo", async (c) => {
    const match = c.req.header("Authorization")
        ? c.req.header("Authorization")!.match(/^Bearer\s+(.+)$/i)
        : null;

    if (!match) {
        return c.json(
            {
                error: "invalid_token",
                error_description: "Missing bearer token",
            },
            401,
        );
    }

    const token = match[1];
    try {
        const user = await getJWTAuth(c, token);
        return c.json(user, 200);
    } catch (error) {
        if (error instanceof AuthorizeError) {
            const message =
                error.errorType == "EXPIRED_TOKEN"
                    ? "Token is expired"
                    : "Invalid token";

            return c.json(
                {
                    error: "invalid_token",
                    error_description: message,
                },
                401,
            );
        }

        throw error;
    }
});

export default app;
