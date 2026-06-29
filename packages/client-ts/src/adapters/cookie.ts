import { decodeJwt } from "jose";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
    parseCookie,
    serializeCookie,
    type CookieOptions,
    type CookieSerialize,
} from "@/utils/cookie";
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
        const jwt = decodeJwt(token);
        if (!jwt.exp) return null;
        return Math.max(0, jwt.exp - Math.floor(Date.now() / 1000));
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
            };
        }

        const jwtAge = key === "token" ? getJWTExpiration(value) : null;

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

export function cookieStorageAdapter(
    auth: UnboundClient,
): (req: RequestLike, res: ResponseLike) => UnboundClient;
export function cookieStorageAdapter(
    auth: UnboundClient,
    req: RequestLike,
    res: ResponseLike,
): UnboundClient;
export function cookieStorageAdapter(
    auth: UnboundClient,
    req?: RequestLike,
    res?: ResponseLike,
): ((req: RequestLike, res: ResponseLike) => UnboundClient) | UnboundClient {
    if (!req || !res) {
        return (req: RequestLike, res: ResponseLike) => {
            return auth.clone({
                storage: createAdapter(req, res),
            });
        };
    }

    return auth.clone({
        storage: createAdapter(req, res),
    });
}
