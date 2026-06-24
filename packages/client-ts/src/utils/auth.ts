import { decodeJwt, decodeProtectedHeader, importJWK, jwtVerify } from "jose";
import type { PublicJWK, Session } from "@/types";

/**
 * Fetches the JSON Web Keys from auth server.
 *
 * @param authUrl - Base auth server URL.
 * @param endpoint - JWKS endpoint path or URL, resolved against `authUrl`.
 * @param fetcher - Fetch implementation to use for the request.
 * @returns {PublicJWK[] | null} The public JWKs, or `null` when the request or response is invalid.
 */
export async function fetchJWKS(
    authUrl: string,
    endpoint?: string,
    fetcher?: typeof fetch,
): Promise<PublicJWK[] | null> {
    fetcher = fetcher ?? fetch;
    const url = new URL(endpoint ?? "/.well-known/jwks.json", authUrl);
    
    const res = await fetcher(url, {
        method: "GET",
        headers: {
            accept: "application/json",
        },
    });

    if (
        !res.ok ||
        !res.headers.get("content-type") ||
        res.headers.get("content-type")!.toLowerCase() != "application/json"
    )
        return null;

    try {
        const json = await res.json();
        if (
            !json ||
            !json.keys ||
            !Array.isArray(json.keys) ||
            Array(json.keys).length == 0 ||
            Array(json.keys).every((e) => e?.kty && e?.crv && e?.kid)
        )
            return null;
        return json.keys as PublicJWK[];
    } catch {}
    return null;
}

/**
 * Verifies an ES256 JWT against a list of public JWKs.
 *
 * @param jwt - JWT to verify.
 * @param jwks - Public JWKs used to find the signing key by `kid`.
 * @returns {boolean} `true` when the token is valid, otherwise `false`.
 */
export async function verifyJWT(
    jwt: string,
    jwks: PublicJWK[],
): Promise<boolean> {
    try {
        const header = decodeProtectedHeader(jwt);
        if (header.alg !== "ES256") return false;

        const jwk = jwks.find((x) => x.kid === header.kid);
        if (!jwk) return false;

        const key = await importJWK(jwk, header.alg);
        await jwtVerify(jwt, key, {
            algorithms: ["ES256"],
        });

        return true;
    } catch {
        return false;
    }
}

/**
 * Builds a session object from JWT claims.
 *
 * @param jwt - JWT containing standard user profile claims.
 * @returns {Session} Session data derived from the token payload.
 */
export function getSessionFromJWT(jwt: string): Session|null {
    try {
        const payload = decodeJwt(jwt);
        const session: Session = {
            access_token: jwt,
        };

        if (typeof payload.exp === "number" && Number.isFinite(payload.exp)) {
            session.expires_in = Math.max(
                0,
                payload.exp - Math.floor(Date.now() / 1000),
            );
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
    } catch {}

    return null;
}
