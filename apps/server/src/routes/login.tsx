import { Hono } from "hono";

import z from "zod";
import { pageValidator } from "@unbound/server/utils/validator";

import {
    generateGoogleOauth,
    generateGithubOauth,
    generateDiscordOauth,
    finishGoogleOauth,
    finishGithubOauth,
    finishDiscordOauth,
} from "@unbound/server/utils/oauth";

import OauthError from "@unbound/server/exceptions/oauth";

import { LoginPage } from "@unbound/web/pages/login";

import type { AppEnv } from "@unbound/server";
import type { OauthStart, OauthResult } from "@unbound/server/utils/oauth";
import type { UserProvider } from "@unbound/types";

const authQuerySchema = z.object({
    redirect_to: z.string().startsWith("/").optional(),
});
const callbackQuerySchema = z.object({
    code: z.string().min(1),
    state: z.string().min(1),
});

const app = new Hono<AppEnv>();

app.get(
    "/login",
    pageValidator("query", authQuerySchema, async (_, c) => {
        await c.get("setFlash")({
            id: "login",
            type: "error",
            message: "Invalid login parameter. Please try again.",
        });
        return c.redirect("/login");
    }),
    async (c) => {
        const { redirect_to } = c.req.valid("query");
        const providers: Record<UserProvider, boolean> = {
            google: Boolean(c.env.GOOGLE_CLIENT_ID),
            github: Boolean(c.env.GITHUB_CLIENT_ID),
            discord: Boolean(c.env.DISCORD_CLIENT_ID),
        };

        return c.render(
            <LoginPage
                providers={providers}
                redirect={redirect_to}
                loggedIn={c.get("isLoggedIn")()}
            />,
            { title: "Login" },
        );
    },
);

app.get(
    "/auth/:provider",
    pageValidator("query", authQuerySchema, async (_, c) => {
        await c.get("setFlash")({
            id: "login",
            type: "error",
            message: "Invalid login parameter. Please try again.",
        });
        return c.redirect("/login");
    }),
    async (c) => {
        const provider = c.req.param("provider");
        if (!["google", "github", "discord"].includes(provider))
            return c.notFound();

        const { redirect_to } = c.req.valid("query");

        const setSession = c.get("setSession");
        const setFlash = c.get("setFlash");

        // Prevent redirect infinite loop
        if (redirect_to?.startsWith(c.req.path)) {
            await setFlash({
                id: "login",
                type: "error",
                message: "Redirect is not valid. Nice try :)",
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
    },
);

app.get(
    "/auth/:provider/callback",
    pageValidator("query", callbackQuerySchema, async (_, c) => {
        await c.get("setFlash")({
            id: "login",
            type: "error",
            message: "Invalid login callback. Please try again.",
        });
        return c.redirect("/login");
    }),
    async (c) => {
        const provider = c.req.param("provider");
        if (!["google", "github", "discord"].includes(provider))
            return c.notFound();

        const { code } = c.req.valid("query");

        const isLoggedIn = c.get("isLoggedIn");
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
                if (
                    error.errorType == "MISSING_LOGIN_SESSION" ||
                    error.errorType == "INVALID_LOGIN_SESSION"
                ) {
                    await setFlash({
                        id: "login",
                        type: "error",
                        message:
                            "This login request has expired. Please try again.",
                    });
                } else {
                    await setFlash({
                        id: "login",
                        type: "error",
                        message: `${name} login failed. Please try again.`,
                    });
                }
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
        const loggedIn = isLoggedIn();

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
            message: loggedIn
                ? "Successfully re-login."
                : "Successfully logged in.",
        });

        return c.redirect(redirectTo ?? "/profile");
    },
);

app.post("/logout", async (c) => {
    const setFlash = c.get("setFlash");
    if (!c.get("isLoggedIn")()) {
        await setFlash({
            id: "logout",
            type: "error",
            message: "You're not logged in.",
        });
    } else {
        c.get("clearSession")();
        await setFlash({
            id: "logout",
            type: "success",
            message: "Successfully logged out.",
        });
    }

    return c.redirect("/");
});

export default app;
