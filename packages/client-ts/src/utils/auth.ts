import type { Session, FinishSignInResult, Scope } from "@/types";
import { AuthUnboundError, type AuthUnboundErrorCode } from "@/exceptions/auth";
import { APIUnboundError } from "@/exceptions/api";
import { decodeBase64Url } from "@/utils";

/**
 * Verify token and get user info.
 *
 * @param token - Access token to verify.
 * @param authUrl - Base auth server URL.
 * @param endpoint - Userinfo endpoint path or URL, resolved against `authUrl`.
 * @param fetcher - Fetch implementation to use for the request.
 * @returns User information from the token.
 * @throws {AuthUnboundError} When the token is invalid or expired.
 * @throws {APIUnboundError} When the request fails.
 */
export async function getUserInfo(
    token: string,
    authUrl: string,
    endpoint?: string,
    fetcher?: typeof fetch,
): Promise<NonNullable<Session["user"]>> {
    fetcher = fetcher ?? fetch;
    const url = new URL(endpoint ?? "/userinfo", authUrl);

    try {
        const res = await fetcher(url, {
            method: "GET",
            headers: {
                authorization: `Bearer ${token}`,
                accept: "application/json",
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                const contentType = res.headers.get("content-type");
                if (contentType?.toLowerCase().includes("application/json")) {
                    try {
                        const json = await res.json();
                        const errorDesc = json?.error_description || "";
                        if (errorDesc.toLowerCase().includes("expired")) {
                            throw new AuthUnboundError("EXPIRED_TOKEN");
                        }
                    } catch (error) {
                        if (error instanceof AuthUnboundError) {
                            throw error;
                        }
                    }
                }
                throw new AuthUnboundError("INVALID_TOKEN");
            }

            throw new APIUnboundError(
                "SERVER_ERROR",
                res.status,
                `Userinfo request failed with status ${res.status}`,
            );
        }

        const json = await res.json();
        if (!json?.sub || typeof json.sub !== "string") {
            throw new APIUnboundError(
                "SERVER_ERROR",
                res.status,
                "Invalid userinfo response format",
            );
        }

        const user: NonNullable<Session["user"]> = {
            id: json.sub,
        };

        if (typeof json.name === "string") user.name = json.name;
        if (typeof json.picture === "string") user.picture = json.picture;
        if (typeof json.email === "string") user.email = json.email;
        if (typeof json.email_verified === "boolean")
            user.email_verified = json.email_verified;

        return user;
    } catch (error) {
        if (
            error instanceof AuthUnboundError ||
            error instanceof APIUnboundError
        ) {
            throw error;
        }
        throw new APIUnboundError(
            "NETWORK_ERROR",
            undefined,
            "Failed to verify token with userinfo",
            error,
        );
    }
}

/**
 * Builds a session object from JWT claims.
 *
 * @param jwt - JWT containing standard user profile claims.
 * @returns Session data derived from the token payload.
 * @throws {AuthUnboundError} When the JWT cannot be decoded or is invalid.
 */
export function getSessionFromJWT(jwt: string): Session {
    try {
        const parts = jwt.split(".");
        if (parts.length !== 3) {
            throw new Error("Invalid JWT format");
        }

        const payload = JSON.parse(decodeBase64Url(parts[1]));
        const session: Session = {
            access_token: jwt,
        };

        if (typeof payload.exp === "number" && Number.isFinite(payload.exp)) {
            const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
            if (expiresIn <= 0) {
                throw new AuthUnboundError("EXPIRED_TOKEN");
            }
            session.expires_in = expiresIn;
        }

        if (typeof payload.sub === "string" && payload.sub.length > 0) {
            const user: NonNullable<Session["user"]> = {
                id: payload.sub,
            };

            if (typeof payload.name === "string") user.name = payload.name;
            if (typeof payload.picture === "string")
                user.picture = payload.picture;
            if (typeof payload.email === "string") user.email = payload.email;
            if (typeof payload.email_verified === "boolean")
                user.email_verified = payload.email_verified;

            session.user = user;
        }

        return session;
    } catch (error) {
        if (error instanceof AuthUnboundError) {
            throw error;
        }
        throw new AuthUnboundError("INVALID_TOKEN", "Failed to decode JWT");
    }
}

/**
 * Generates the authorization URL for OAuth2/OIDC flow.
 *
 * @param params - Authorization parameters including redirect_uri, scopes, challenge, and state.
 * @param auth_url - Base auth server URL.
 * @param endpoint - Authorization endpoint path or URL, resolved against `auth_url`.
 * @returns The complete authorization URL as a string.
 */
export function generateAuthUrl(
    params: {
        redirect_uri: string;
        scopes: Scope[];
        challenge: string;
        state: string;
    },
    auth_url: string,
    endpoint?: string,
): string {
    const url = new URL(endpoint ?? "/authorize", auth_url);
    url.searchParams.set(
        "client_id",
        `origin:${new URL(params.redirect_uri).origin}`,
    );
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", params.scopes.join(" "));
    url.searchParams.set("redirect_uri", params.redirect_uri);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge", params.challenge);
    url.searchParams.set("state", params.state);

    return url.toString();
}

/**
 * Exchanges an authorization code for an access token.
 *
 * @param params - Token exchange parameters including code, redirectUri, and verifier.
 * @param authUrl - Base auth server URL.
 * @param endpoint - Token endpoint path or URL, resolved against `authUrl`.
 * @param fetcher - Fetch implementation to use for the request.
 * @returns The token response with access_token and expires_in.
 * @throws {AuthUnboundError} When the error is a known auth flow error (400 with matching code).
 * @throws {APIUnboundError} When the error is an API/network error.
 */
export async function exchangeCode(
    params: {
        code: string;
        redirectUri: string;
        verifier: string;
    },
    authUrl: string,
    endpoint?: string,
    fetcher?: typeof fetch,
): Promise<FinishSignInResult> {
    fetcher = fetcher ?? fetch;
    const url = new URL(endpoint ?? "/token", authUrl);

    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", params.code);
    body.set("redirect_uri", params.redirectUri);
    body.set("client_id", `origin:${new URL(params.redirectUri).origin}`);
    body.set("code_verifier", params.verifier);

    try {
        const res = await fetcher(url, {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                accept: "application/json",
            },
            body: body.toString(),
        });

        if (!res.ok) {
            // Try to parse as JSON for auth errors
            if (res.status === 400) {
                const contentType = res.headers.get("content-type");
                if (contentType?.toLowerCase().includes("application/json")) {
                    try {
                        const json = await res.json();
                        if (json?.code && typeof json.code === "string") {
                            // Check if it's a valid auth error code
                            const authErrorCodes = [
                                "INVALID_REDIRECT_URI",
                                "INVALID_CODE",
                                "INVALID_STATE",
                                "INVALID_VERIFIER",
                                "EXPIRED_CODE",
                                "USED_CODE",
                            ] satisfies AuthUnboundErrorCode[];
                            if (authErrorCodes.includes(json.code)) {
                                throw new AuthUnboundError(
                                    json.code,
                                    json.message,
                                );
                            }
                        }
                    } catch (error) {
                        if (error instanceof AuthUnboundError) {
                            throw error;
                        }
                        // JSON parse failed, fall through to API error
                    }
                }
            }

            // Not a known auth error, treat as API error
            throw new APIUnboundError(
                "SERVER_ERROR",
                res.status,
                `Token exchange failed with status ${res.status}`,
            );
        }

        const json = await res.json();
        return {
            access_token: json.access_token,
            expires_in: json.expires_in,
        };
    } catch (error) {
        // Re-throw known errors
        if (
            error instanceof AuthUnboundError ||
            error instanceof APIUnboundError
        ) {
            throw error;
        }

        // Network or other errors
        throw new APIUnboundError(
            "NETWORK_ERROR",
            undefined,
            "Failed to exchange authorization code",
            error,
        );
    }
}
