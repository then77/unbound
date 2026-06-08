import { Hono } from "hono";

import z from "zod";
import { zValidator } from "@hono/zod-validator";

import {
    generateGoogleOauth,
    generateGithubOauth,
    generateDiscordOauth,
    finishGoogleOauth,
    finishGithubOauth,
    finishDiscordOauth,
} from "@unbound/server/utils/oauth";

import OauthError from "@unbound/server/exceptions/oauth";

import type { AppEnv } from "@unbound/server";
import type { OauthStart, OauthResult } from "@unbound/server/utils/oauth";

const authQuerySchema = z.object({
    redirect_to: z.string().startsWith("/").optional(),
});
const callbackQuerySchema = z.object({
    code: z.string().min(1),
    state: z.string().min(1),
});

const app = new Hono<AppEnv>();

app.get("/login", zValidator("query", authQuerySchema), async (c) => {
    const { redirect_to } = c.req.valid("query");
    function make(provider: string) {
        const url = new URL(`/auth/${provider}`, c.req.url);

        if (redirect_to) {
            url.searchParams.set("redirect_to", redirect_to);
        }

        return url.pathname + url.search;
    }

    return c.render(
        <>
            <a href={make("google")}>Login with Google</a>
            <br />
            <a href={make("github")}>Login with Github</a>
            <br />
            <a href={make("discord")}>Login with Discord</a>
        </>,
        { title: "Login" },
    );
});

app.get("/auth/:provider", zValidator("query", authQuerySchema), async (c) => {
    const provider = c.req.param("provider");
    if (!["google", "github", "discord"].includes(provider))
        return c.notFound();

    const { redirect_to } = c.req.valid("query");

    const setSession = c.get("setSession");
    const setFlash = c.get("setFlash");

    // Prevent redirect infinite loop
    if (redirect_to == c.req.path) {
        await setFlash({
            id: "login",
            type: "error",
            message: "Redirect is not valid. Nice try. :)",
        });

        return c.redirect("/login");
    }

    let result: OauthStart;
    const generateCallbacks: Record<
        typeof provider,
        (context: typeof c) => OauthStart
    > = {
        google: generateGoogleOauth,
        github: generateGithubOauth,
        discord: generateDiscordOauth,
    };

    try {
        result = generateCallbacks[provider](c);
    } catch (error) {
        if (
            error instanceof OauthError &&
            error.errorType == "PROVIDER_UNAVAILABLE"
        ) {
            const name = provider[0].toUpperCase() + provider.slice(1);
            await setFlash({
                id: "login",
                type: "error",
                message: `${name} login is unavailable. Please try again later.`,
            });
        } else {
            await setFlash({
                id: "login",
                type: "error",
                message:
                    "Unknown error occured when logging in. Please try again.",
            });
        }

        const url = new URL("/login", c.req.url);
        if (redirect_to) {
            url.searchParams.set("redirect_to", redirect_to);
        }
        return c.redirect(url);
    }

    await setSession({
        login_method: provider,
        login_redirect: redirect_to,
        login_verifier: result.verifier,
    });

    return c.redirect(result.url);
});

app.get(
    "/auth/:provider/callback",
    zValidator("query", callbackQuerySchema),
    async (c) => {
        const provider = c.req.param("provider");
        if (!["google", "github", "discord"].includes(provider))
            return c.notFound();

        const { code } = c.req.valid("query");

        const setSession = c.get("setSession");
        const setFlash = c.get("setFlash");

        async function clearLoginSession() {
            await setSession({
                login_method: undefined,
                login_redirect: null,
                login_verifier: null,
            });
        }

        let result: OauthResult;
        const finishCallbacks: Record<
            typeof provider,
            (context: typeof c, code: string) => Promise<OauthResult>
        > = {
            google: finishGoogleOauth,
            github: finishGithubOauth,
            discord: finishDiscordOauth,
        };

        try {
            result = await finishCallbacks[provider](c, code);
        } catch (error) {
            if (error instanceof OauthError) {
                const name = provider[0].toUpperCase() + provider.slice(1);
                await setFlash({
                    id: "login",
                    type: "error",
                    message: `${name} login failed. Please try again.`,
                });
            } else {
                await setFlash({
                    id: "login",
                    type: "error",
                    message:
                        "Unknown error occured when logging in. Please try again.",
                });
            }

            await clearLoginSession();
            return c.redirect("/login");
        }

        const redirectTo = c.get("session")?.login_redirect;

        await clearLoginSession();
        await setSession({
            sub: result.sub,
            provider: result.provider,
            name: result.name,
            picture: result.picture,
            email: result.email,
            email_verified: result.email_verified,
        });

        await setFlash({
            id: "login",
            type: "success",
            message: "Successfully logged in.",
        });

        return c.redirect(redirectTo ?? "/profile");
    },
);

export default app;
