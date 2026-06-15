import ky from "ky";

import {
    generateRandomString,
    generatePKCE,
} from "@unbound/server/utils/generate";

import OauthError, {
    type OauthErrorType,
} from "@unbound/server/exceptions/oauth";

import type { AppEnv } from "@unbound/server/server";
import type { Context } from "hono";
import type { User, UserProvider } from "@unbound/types";

export type OauthStart = { url: string; state: string; verifier: string };
export type OauthResult = User;

export function generateOauthUrl(
    authorizeUrl: string,
    clientId: string,
    redirectUri: string,
    scopes: string[],
    ...params: Record<string, string>[]
): OauthStart {
    const state = generateRandomString();
    const { verifier, challenge } = generatePKCE();

    const url = new URL(authorizeUrl);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("scope", scopes.join(" "));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("state", state);

    params.forEach((paramObject) => {
        Object.entries(paramObject).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    });

    return { url: url.toString(), state, verifier };
}

function getOauthSession(c: Context<AppEnv>) {
    const session = c.get("session");
    if (!session || !session.login_method || !session.login_state || !session.login_verifier)
        return null;
    return { method: session.login_method, state: session.login_state, verifier: session.login_verifier };
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return undefined;
}

async function handleOauthError<T>(
    provider: UserProvider,
    errorType: OauthErrorType,
    callback: () => Promise<T>,
) {
    try {
        return await callback();
    } catch (error) {
        console.log(error);
        throw new OauthError(provider, errorType, getErrorMessage(error));
    }
}

export function generateGoogleOauth(c: Context<AppEnv>) {
    const clientId = c.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${new URL(c.req.url).origin}/auth/google/callback`;

    if (!clientId) throw new OauthError("google", "PROVIDER_UNAVAILABLE");

    return generateOauthUrl(
        "https://accounts.google.com/o/oauth2/v2/auth",
        clientId,
        redirectUri,
        ["profile", "email"],
    );
}

export function generateGithubOauth(c: Context<AppEnv>) {
    const clientId = c.env.GITHUB_CLIENT_ID;
    const redirectUri = `${new URL(c.req.url).origin}/auth/github/callback`;

    if (!clientId) throw new OauthError("github", "PROVIDER_UNAVAILABLE");

    return generateOauthUrl(
        "https://github.com/login/oauth/authorize",
        clientId,
        redirectUri,
        ["read:user", "user:email"],
    );
}

export function generateDiscordOauth(c: Context<AppEnv>) {
    const clientId = c.env.DISCORD_CLIENT_ID;
    const redirectUri = `${new URL(c.req.url).origin}/auth/discord/callback`;

    if (!clientId) throw new OauthError("discord", "PROVIDER_UNAVAILABLE");

    return generateOauthUrl(
        "https://discord.com/oauth2/authorize",
        clientId,
        redirectUri,
        ["identify", "email"],
    );
}

export async function finishGoogleOauth(
    c: Context<AppEnv>,
    code: string,
    state: string,
): Promise<OauthResult> {
    const clientId = c.env.GOOGLE_CLIENT_ID;
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${new URL(c.req.url).origin}/auth/google/callback`;

    if (!clientId || !clientSecret)
        throw new OauthError("google", "PROVIDER_UNAVAILABLE");

    const oauthSession = getOauthSession(c);

    if (!oauthSession) throw new OauthError("google", "MISSING_LOGIN_SESSION");
    if (oauthSession.method != "google" || oauthSession.state != state)
        throw new OauthError("google", "INVALID_LOGIN_SESSION");

    const { access_token } = await handleOauthError(
        "google",
        "ERROR_EXCHANGE",
        () =>
            ky
                .post<{
                    access_token: string;
                }>("https://oauth2.googleapis.com/token", {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        grant_type: "authorization_code",
                        code,
                        client_id: clientId,
                        client_secret: clientSecret,
                        redirect_uri: redirectUri,
                        code_verifier: oauthSession.verifier,
                    }),
                })
                .json(),
    );

    const user = await handleOauthError("google", "ERROR_USERINFO", () =>
        ky
            .get<{
                id: string;
                name?: string;
                picture?: string;
                email?: string;
                verified_email?: boolean;
            }>("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            })
            .json(),
    );

    return {
        sub: user.id,
        provider: "google",
        name: user.name,
        picture: user.picture,
        email: user.email,
        email_verified: user.verified_email,
    };
}

export async function finishGithubOauth(
    c: Context<AppEnv>,
    code: string,
    state: string,
): Promise<OauthResult> {
    const clientId = c.env.GITHUB_CLIENT_ID;
    const clientSecret = c.env.GITHUB_CLIENT_SECRET;
    const redirectUri = `${new URL(c.req.url).origin}/auth/github/callback`;

    if (!clientId || !clientSecret)
        throw new OauthError("github", "PROVIDER_UNAVAILABLE");

    const oauthSession = getOauthSession(c);

    if (!oauthSession) throw new OauthError("github", "MISSING_LOGIN_SESSION");
    if (oauthSession.method != "github" || oauthSession.state != state)
        throw new OauthError("github", "INVALID_LOGIN_SESSION");

    const { access_token } = await handleOauthError(
        "github",
        "ERROR_EXCHANGE",
        () =>
            ky
                .post<{
                    access_token: string;
                }>("https://github.com/login/oauth/access_token", {
                    headers: {
                        Accept: "application/json",
                    },
                    body: new URLSearchParams({
                        code,
                        client_id: clientId,
                        client_secret: clientSecret,
                        redirect_uri: redirectUri,
                        code_verifier: oauthSession.verifier,
                    }),
                })
                .json(),
    );

    const [user, emails] = await handleOauthError(
        "github",
        "ERROR_USERINFO",
        () =>
            Promise.all([
                ky
                    .get<{
                        id: number;
                        login: string;
                        name?: string;
                        avatar_url?: string;
                    }>("https://api.github.com/user", {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    })
                    .json(),
                ky
                    .get<
                        Array<{
                            email: string;
                            primary: boolean;
                            verified: boolean;
                        }>
                    >("https://api.github.com/user/emails", {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    })
                    .json(),
            ]),
    );

    const primaryEmail = emails.find((email) => email.primary);

    return {
        sub: String(user.id),
        provider: "github",
        name: user.name ?? user.login,
        picture: user.avatar_url,
        email: primaryEmail?.email,
        email_verified: primaryEmail?.verified,
    };
}

export async function finishDiscordOauth(
    c: Context<AppEnv>,
    code: string,
    state: string,
): Promise<OauthResult> {
    const clientId = c.env.DISCORD_CLIENT_ID;
    const clientSecret = c.env.DISCORD_CLIENT_SECRET;
    const redirectUri = `${new URL(c.req.url).origin}/auth/discord/callback`;

    if (!clientId || !clientSecret)
        throw new OauthError("discord", "PROVIDER_UNAVAILABLE");

    const oauthSession = getOauthSession(c);

    if (!oauthSession) throw new OauthError("discord", "MISSING_LOGIN_SESSION");
    if (oauthSession.method != "discord" || oauthSession.state != state)
        throw new OauthError("discord", "INVALID_LOGIN_SESSION");

    const { access_token } = await handleOauthError(
        "discord",
        "ERROR_EXCHANGE",
        () =>
            ky
                .post<{
                    access_token: string;
                }>("https://discord.com/api/oauth2/token", {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        grant_type: "authorization_code",
                        code,
                        client_id: clientId,
                        client_secret: clientSecret,
                        redirect_uri: redirectUri,
                        code_verifier: oauthSession.verifier,
                    }),
                })
                .json(),
    );

    const user = await handleOauthError("discord", "ERROR_USERINFO", () =>
        ky
            .get<{
                id: string;
                username: string;
                global_name?: string;
                avatar?: string;
                email?: string;
                verified?: boolean;
            }>("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            })
            .json(),
    );

    return {
        sub: user.id,
        provider: "discord",
        name: user.global_name ?? user.username,
        picture: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : undefined,
        email: user.email,
        email_verified: user.verified,
    };
}
