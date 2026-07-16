import type { IncomingMessage, ServerResponse } from "node:http";
import {
    parseCookie,
    serializeCookie,
    type CookieOptions,
    type CookieSerialize,
} from "@/utils/cookie";
import { decodeBase64Url } from "@/utils";
import type {
    StorageAdapter,
    StorageAdapterBatch,
    StorageAdapterKey,
    UnboundClient,
} from "@/types";

type RequestLike = Request | IncomingMessage;
type ResponseLike = Response | ServerResponse;

/**
 * Options for the cookie storage adapter.
 */
export interface CookieStorageProps {
    /**
     * Prefix added to all storage keys.
     *
     * @defaultValue `"unbound_"`
     */
    prefix?: string;

    cookie_options?: Partial<CookieOptions>;
}

function getJWTExpiration(token: string): number | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = JSON.parse(decodeBase64Url(parts[1]));
        if (!payload.exp) return null;
        return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
    } catch {
        return null;
    }
}

function getCookieHeader(req: RequestLike): string | null {
    if (req instanceof Request) {
        return req.headers.get("cookie");
    }
    // Node.js IncomingMessage
    return (req.headers.cookie as string) || null;
}

function setCookieHeader(res: ResponseLike, cookie: string): void {
    if (res instanceof Response) {
        res.headers.append("Set-Cookie", cookie);
    } else {
        // Node.js ServerResponse
        const existing = res.getHeader("Set-Cookie");
        if (!existing) {
            res.setHeader("Set-Cookie", cookie);
        } else if (Array.isArray(existing)) {
            res.setHeader("Set-Cookie", [...existing, cookie]);
        } else {
            res.setHeader("Set-Cookie", [existing as string, cookie]);
        }
    }
}

function createAdapter(
    req: RequestLike,
    res: ResponseLike,
    options?: CookieStorageProps,
): StorageAdapter {
    const prefix = options?.prefix ?? "unbound_";
    const persist = (key: StorageAdapterKey) => key == "token";
    const cookieOpts = options?.cookie_options;

    function buildCookie(
        key: StorageAdapterKey,
        value: string | null,
    ): CookieSerialize {
        const name = `${prefix}${key}`;

        // value null means remove cookie
        if (value === null) {
            return {
                name,
                value: "",
                maxAge: 0,
                path: cookieOpts?.path ?? "/",
                domain: cookieOpts?.domain,
            };
        }

        const jwtAge = key === "token" ? getJWTExpiration(value) : null;

        // If the JWT is already expired, emit a deletion cookie
        // rather than persisting a dead token.
        if (jwtAge === 0) {
            return {
                name,
                value: "",
                maxAge: 0,
                path: cookieOpts?.path ?? "/",
                domain: cookieOpts?.domain,
            };
        }

        return {
            name,
            value,
            httpOnly: cookieOpts?.httpOnly ?? true,
            secure: cookieOpts?.secure ?? true,
            path: cookieOpts?.path ?? "/",
            domain: cookieOpts?.domain,
            sameSite: cookieOpts?.sameSite ?? "lax",
            maxAge: persist(key)
                ? (cookieOpts?.maxAge ?? jwtAge ?? 900)
                : undefined,
        };
    }

    const batchAdapter: StorageAdapterBatch = {
        query: async (keys) => {
            const cookieHeader = getCookieHeader(req);
            const cookies = parseCookie(cookieHeader);
            const result: Partial<Record<StorageAdapterKey, string | null>> =
                {};
            for (const key of keys) {
                const cookie = cookies.find(
                    (c) => c.name === `${prefix}${key}`,
                );
                result[key] = cookie?.value ?? null;
            }

            return result;
        },
        mutate: async (values) => {
            const entries = Object.entries(values) as [
                StorageAdapterKey,
                string | null,
            ][];

            const serialized = serializeCookie(
                entries.map(([key, value]) => buildCookie(key, value)),
            );

            for (const cookie of serialized) {
                setCookieHeader(res, cookie);
            }
        },
    };

    return {
        get: async (key) => {
            return batchAdapter.query([key]).then((r) => r[key] ?? null);
        },
        set: async (key, value) => {
            return batchAdapter.mutate({
                [key]: value,
            });
        },
        remove: async (key) => {
            return batchAdapter.mutate({
                [key]: null,
            });
        },
        query: batchAdapter.query,
        mutate: batchAdapter.mutate,
    };
}

/**
 * Creates a cookie-based middleware for persisting Unbound auth state
 * in HTTP-only cookies.
 *
 * This overload returns a middleware function compatible with Express
 * and Node.js HTTP servers. The middleware attaches a request-scoped
 * auth client to `req.auth` on every request.
 *
 * For other server frameworks, see the direct usage overload or
 * @see {@link https://docs.unbound.rlzy.me/use-on-server}
 *
 * @example
 * ```ts
 * // Express middleware
 * app.use(cookieStorageAdapter(client));
 *
 * app.get('/api/user', async (req, res) => {
 *   const session = await req.auth.getSession();
 *   res.json(session);
 * });
 * ```
 *
 * @param auth - The Unbound client instance.
 * @param options - Cookie storage adapter options.
 * @returns A middleware function that attaches the auth client to `req.auth`.
 */
export function cookieStorageAdapter(
    auth: UnboundClient,
    options?: CookieStorageProps,
): (req: RequestLike, res: ResponseLike, next?: () => void) => void;
/**
 * Creates a cookie-based auth client bound to a specific
 * request/response pair.
 *
 * This overload is useful when you need a one-off auth client for a
 * single route handler, or when working with frameworks that don't
 * support Express-style middleware (e.g. Next.js API routes, plain
 * Node.js `http`).
 *
 * For other server frameworks,
 * @see {@link https://docs.unbound.rlzy.me/use-on-server}
 *
 * @example
 * ```ts
 * // Express route handler
 * app.get('/api/auth', (req, res) => {
 *   const auth = cookieStorageAdapter(client, req, res);
 *   const session = await auth.getSession();
 * });
 * ```
 *
 * @example
 * ```ts
 * // Next.js Pages API route
 * export default function handler(req, res) {
 *   const auth = cookieStorageAdapter(client, req, res);
 *   const session = await auth.getSession();
 * }
 * ```
 *
 * @param auth - The Unbound client instance.
 * @param req - The incoming HTTP request (`Request` or `IncomingMessage`).
 * @param res - The outgoing HTTP response (`Response` or `ServerResponse`).
 * @param options - Cookie storage adapter options.
 * @returns A new Unbound client with cookie storage configured.
 */
export function cookieStorageAdapter(
    auth: UnboundClient,
    req: RequestLike,
    res: ResponseLike,
    options?: CookieStorageProps,
): UnboundClient;
export function cookieStorageAdapter(
    auth: UnboundClient,
    reqOrOptions?: RequestLike | CookieStorageProps,
    res?: ResponseLike,
    options?: CookieStorageProps,
):
    | ((req: RequestLike, res: ResponseLike, next?: () => void) => void)
    | UnboundClient {
    // Middleware usage: cookieStorageAdapter(auth, options?)
    if (
        !reqOrOptions ||
        (!res &&
            typeof reqOrOptions === "object" &&
            !("headers" in reqOrOptions))
    ) {
        const opts = reqOrOptions as CookieStorageProps | undefined;
        return (req: RequestLike, res: ResponseLike, next?: () => void) => {
            // Attach auth client to request object
            (req as any).auth = auth.clone({
                storage: createAdapter(req, res, opts),
            });
            if (next) next();
        };
    }

    // Direct usage: cookieStorageAdapter(auth, req, res, options?)
    const req = reqOrOptions as RequestLike;
    if (!res) {
        throw new Error("Response object is required when using direct mode");
    }
    return auth.clone({
        storage: createAdapter(req, res, options),
    });
}

/**
 * Type augmentation for `req.auth` when using the adapter as middleware.
 *
 * For Express, typing is provided automatically.
 * For plain Node.js `http`, augment `IncomingMessage` below.
 *
 * Or cast manually:
 * ```ts
 * const auth = (req as any).auth as UnboundClient;
 * ```
 */
declare global {
    namespace Express {
        interface Request {
            auth?: UnboundClient;
        }
    }
}
declare module "node:http" {
    interface IncomingMessage {
        auth?: UnboundClient;
    }
}
