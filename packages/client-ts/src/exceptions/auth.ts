import { UnboundError } from "@/exceptions";

/**
 * Known authorization and token flow failures for auth error.
 */
export type AuthUnboundErrorCode =
    | "MISSING_REDIRECT_URI"
    | "MISSING_SCOPES"
    | "MISSING_CODE"
    | "MISSING_VERIFIER"
    | "INVALID_REDIRECT_URI"
    | "INVALID_CODE"
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
    MISSING_CODE:
        "Missing authorization code.",
    MISSING_VERIFIER:
        "Missing PKCE code verifier. Make sure to call startSignIn() before finishing sign in.",
    INVALID_REDIRECT_URI:
        "Invalid redirect URI. It must match the registered callback URL exactly.",
    INVALID_CODE:
        "Invalid authorization code. It may be malformed or not issued by the server.",
    INVALID_VERIFIER:
        "Invalid code verifier. It does not match the one used during sign-in initiation.",
    EXPIRED_CODE:
        "Authorization code has expired. Please start the sign-in flow again.",
    USED_CODE:
        "Authorization code has already been used. Each code can only be exchanged once.",
    MISSING_TOKEN:
        "Missing token. Authentication failed or session is not initialized.",
    INVALID_TOKEN: "Invalid token. It may be corrupted, or signed incorrectly.",
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
