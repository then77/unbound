import { decodeJwt, decodeProtectedHeader, importJWK, jwtVerify } from "jose";
import type { PublicJWK, Session, FinishSignInResult, Scope } from "@/types";
import { AuthUnboundError, type AuthUnboundErrorCode } from "@/exceptions/auth";
import { APIUnboundError } from "@/exceptions/api";

/**
 * Fetches the JSON Web Keys from auth server.
 *
 * @param authUrl - Base auth server URL.
 * @param endpoint - JWKS endpoint path or URL, resolved against `authUrl`.
 * @param fetcher - Fetch implementation to use for the request.
 * @returns The public JWKs.
 * @throws {APIUnboundError} When the request fails or response is invalid.
 */
export async function fetchJWKS(
    authUrl: string,
    endpoint?: string,
    fetcher?: typeof fetch,
): Promise<PublicJWK[]> {
    fetcher = fetcher ?? fetch;
    const url = new URL(endpoint ?? "/.well-known/jwks.json", authUrl);

    try {
        const res = await fetcher(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!res.ok) {
            throw new APIUnboundError(
                "SERVER_ERROR",
                res.status,
                `Failed to fetch JWKS: ${res.status}`,
            );
        }

        const contentType = res.headers.get("content-type");
        if (
            !contentType ||
            !contentType.toLowerCase().includes("application/json")
        ) {
            throw new APIUnboundError(
                "SERVER_ERROR",
                res.status,
                "Invalid content-type for JWKS response",
            );
        }

        const json = await res.json();
        if (
            !json ||
            !json.keys ||
            !Array.isArray(json.keys) ||
            json.keys.length === 0
        ) {
            throw new APIUnboundError(
                "SERVER_ERROR",
                res.status,
                "Invalid JWKS response format",
            );
        }
        return json.keys as PublicJWK[];
    } catch (error) {
        if (error instanceof APIUnboundError) {
            throw error;
        }
        throw new APIUnboundError(
            "NETWORK_ERROR",
            undefined,
            "Failed to fetch JWKS",
            error,
        );
    }
}

/**
 * Verifies an ES256 JWT against a list of public JWKs.
 *
 * @param jwt - JWT to verify.
 * @param jwks - Public JWKs used to find the signing key by `kid`.
 * @throws {AuthUnboundError} When the token is invalid or verification fails.
 */
export async function verifyJWT(jwt: string, jwks: PublicJWK[]): Promise<void> {
    try {
        const header = decodeProtectedHeader(jwt);
        if (header.alg !== "ES256") {
            throw new AuthUnboundError(
                "INVALID_TOKEN",
                "Unsupported algorithm",
            );
        }

        const jwk = jwks.find((x) => x.kid === header.kid);
        if (!jwk) {
            throw new AuthUnboundError(
                "INVALID_TOKEN",
                "Key not found in JWKS",
            );
        }

        const key = await importJWK(jwk, header.alg);
        await jwtVerify(jwt, key, {
            algorithms: ["ES256"],
        });
    } catch (error) {
        if (error instanceof AuthUnboundError) {
            throw error;
        }
        throw new AuthUnboundError("INVALID_TOKEN", "JWT verification failed");
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
        const payload = decodeJwt(jwt);
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
    url.searchParams.set("scopes", params.scopes.join(" "));
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
