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

// Determine if in browser environment
export function isBrowser() {
    return (
        typeof window !== "undefined" && window.location && window.localStorage
    );
}

/**
 * Returns the base URL of the current runtime environment.
 *
 * In browser environments, this resolves to `window.location.origin`.
 * In server environments (Node.js, edge runtimes, SSR), this returns `null`
 * because the base URL cannot be reliably inferred.
 *
 * @returns {string | null} The origin URL (e.g. `https://example.com`) or `null`
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
 * @returns {string | null} Fully qualified redirect URI or `null` if it cannot be resolved.
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

