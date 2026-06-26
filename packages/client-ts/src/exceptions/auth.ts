import { UnboundError } from "@/exceptions/base";

/**
 * Known authorization and token flow failures for auth error.
 */
export type AuthUnboundErrorCode =
    | "MISSING_REDIRECT_URI"
    | "MISSING_SCOPES"
    | "MISSING_CODE"
    | "MISSING_STATE"
    | "MISSING_VERIFIER"
    | "INVALID_REDIRECT_URI"
    | "INVALID_CODE"
    | "INVALID_STATE"
    | "INVALID_VERIFIER"
    | "EXPIRED_CODE"
    | "USED_CODE"
    | "MISSING_TOKEN"
    | "INVALID_TOKEN"
    | "EXPIRED_TOKEN";

export const authUnboundErrorMessages: Record<AuthUnboundErrorCode, string> = {
    MISSING_REDIRECT_URI:
        "Missing redirect URI. Set it in client config or pass it when calling the function.",
    MISSING_SCOPES:
        "Missing scopes. Please specify at least one scope (e.g. 'openid', 'profile', 'email').",
    MISSING_CODE: "Missing authorization code.",
    MISSING_STATE: "Missing login state.",
    MISSING_VERIFIER: "Missing PKCE code verifier.",
    INVALID_REDIRECT_URI: "Invalid redirect URI.",
    INVALID_CODE: "Invalid authorization code.",
    INVALID_STATE: "Invalid login state.",
    INVALID_VERIFIER: "Invalid code verifier.",
    EXPIRED_CODE: "Authorization code has expired. Please sign-in again.",
    USED_CODE: "Authorization code has already been used.",
    MISSING_TOKEN: "Missing session token.",
    INVALID_TOKEN: "Invalid session token.",
    EXPIRED_TOKEN: "Token has expired. Please sign in again.",
};

/**
 * Error thrown for auth flow failures.
 *
 * This error is for auth flow problems that callers can handle
 * by inspecting {@link code}, such as missing parameters, invalid PKCE
 * verifier values, expired authorization codes, or invalid tokens.
 */
export class AuthUnboundError extends UnboundError {
    /**
     * Auth error code.
     *
     * See {@link AuthUnboundErrorCode} for all available codes
     */
    public override readonly code: AuthUnboundErrorCode;

    /**
     * Creates an auth flow error.
     *
     * @param code - Auth error code.
     * @param message - Optional error description.
     */
    constructor(code: AuthUnboundErrorCode, message?: string) {
        if (!message && code in authUnboundErrorMessages) {
            message = authUnboundErrorMessages[code];
        }
        super(code, message);
        this.name = "AuthUnboundError";
        this.code = code;
    }
}
