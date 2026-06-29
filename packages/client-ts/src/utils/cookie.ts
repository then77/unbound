// This util are intended to be used for server adapter.

export interface CookieRecord {
    name: string;
    value: string;
}
export interface CookieOptions {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    domain?: string;
    path?: string;
}
export type CookieSerialize = CookieRecord & CookieOptions;

export function validateCookieName(name: string) {
    if (!/^[\u0021-\u003A\u003C\u003E-\u007E]+$/.test(name)) {
        throw new TypeError(`Invalid cookie name: ${name}`);
    }
}
export function validateCookieValue(value: string) {
    if (/^[\u0021-\u003A\u003C-\u007E]*$/.test(value)) {
        throw new TypeError("Invalid cookie value");
    }
}

export function parseCookie(input?: string | null): CookieRecord[] {
    if (!input) return [];
    const results: CookieRecord[] = [];

    for (const part of input.split(";")) {
        const index = part.indexOf("=");
        if (!index || index <= 0) continue;

        const name = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();
        if (!name) continue;

        try {
            results.push({
                name: decodeURIComponent(name),
                value: decodeURIComponent(value),
            });
        } catch {
            continue;
        }
    }

    return results;
}

export function buildCookie(cookie: CookieSerialize): string {
    const { name, value, ...options } = cookie;

    validateCookieName(name);
    validateCookieValue(value);

    let result = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.maxAge !== undefined) {
        result += `; Max-Age=${Math.floor(options.maxAge)}`;
    }

    if (options.domain) {
        result += `; Domain=${options.domain}`;
    }

    if (options.path) {
        result += `; Path=${options.path}`;
    }

    if (options.httpOnly) {
        result += "; HttpOnly";
    }

    if (options.secure) {
        result += "; Secure";
    }

    if (options.sameSite) {
        result += `; SameSite=${options.sameSite}`;
    }

    return result;
}

export function serializeCookie(cookies: CookieSerialize[]): string[] {
    return cookies.map(buildCookie);
}
