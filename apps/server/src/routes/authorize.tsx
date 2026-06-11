import { Hono } from "hono";

import z from "zod";
import { pageValidator } from "@unbound/server/utils/validator";

import { AuthorizePage } from "@unbound/web/pages/authorize";

import { getFaviconBase64 } from "@unbound/server/utils";

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

        nonce: z.string().optional(),
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
        const redirectOrigin = new URL(data.redirect_uri).origin;

        if (redirectOrigin !== clientOrigin) {
            ctx.addIssue({
                code: "custom",
                path: ["redirect_uri"],
                message: "redirect_uri origin must match client_id origin",
            });
        }

        if (data.code_challenge && !data.code_challenge_method) {
            ctx.addIssue({
                code: "custom",
                path: ["code_challenge_method"],
                message:
                    "code_challenge_method is required when code_challenge is provided",
            });
        }
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

        return c.render(<AuthorizePage session={session} clientId={clientUrl} scopes={scope} cancelUrl={cancelUrl.toString()} clientIcon={clientIcon}  />, { title: `Authorize` });
    },
);

export default app;
