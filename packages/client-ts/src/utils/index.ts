import type {
    AuthUnboundError,
    APIUnboundError,
    UnboundError,
} from "@/exceptions";
import type { FunctionResult } from "@/types";

// Helper function for result return.
export function ok<T>(data: T) {
    return { data, error: null } satisfies FunctionResult<T>;
}
export function fail(
    error: AuthUnboundError | APIUnboundError | UnboundError | Error,
) {
    return { data: null, error } satisfies FunctionResult<never>;
}

/**
 * Decodes a base64url-encoded string into a UTF-8 string.
 */
export function decodeBase64Url(str: string): string {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding so atob (which is spec-strict) never throws
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    if (typeof atob === "function") {
        // atob returns a binary (Latin-1) string; reassemble UTF-8 bytes
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }
    return Buffer.from(padded, "base64").toString("utf-8");
}

// Determine if in browser environment
export function isBrowser() {
    try {
        return (
            typeof window !== "undefined" &&
            window.location &&
            window.localStorage
        );
    } catch {
        return false;
    }
}

/**
 * Returns the base URL of the current runtime environment.
 *
 * In browser environments, this resolves to `window.location.origin`.
 * In server environments (Node.js, edge runtimes, SSR), this returns `null`
 * because the base URL cannot be reliably inferred.
 *
 * @returns The origin URL (e.g. `https://example.com`) or `null`
 */
export function getBaseURL(): string | null {
    if (isBrowser()) {
        return window.location.origin;
    }
    return null;
}

/**
 * Resolves a valid redirect URI for authentication flows.
 *
 * In server environment, input requires absolute url to work,
 * or result might be null. See {@link getBaseURL} for info.
 *
 * @param input - Redirect URI input
 *
 * @returns Fully qualified redirect URI or `null` if it cannot be resolved.
 *
 * @example
 * ```ts
 * getRedirectUri();
 * // "https://example.com/callback" (browser)
 * // null (server)
 *
 * getRedirectUri("/auth/callback");
 * // "https://example.com/auth/callback" (browser)
 * // null (server)
 *
 * getRedirectUri("https://example.com/callback");
 * // "https://example.com/callback" (browser & server)
 * ```
 */
export function getRedirectUri(input?: string | null): string | null {
    const base = getBaseURL();

    // undefined/null → auto resolve
    if (input === undefined || input === null) {
        if (!isBrowser()) return null;
        return `${base ?? ""}/callback`;
    }

    try {
        const parsed = new URL(
            input,
            isBrowser() ? window.location.origin : undefined,
        );

        // Accept only http/https
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return parsed.toString();
        }
        return null;
    } catch {} // Continue check as path

    if (input.startsWith("/")) {
        if (isBrowser() && base) {
            return `${base}${input}`;
        }
        return null;
    }

    return null;
}
