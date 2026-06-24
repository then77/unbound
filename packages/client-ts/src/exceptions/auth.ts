import { UnboundError } from "@/exceptions";

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

export class AuthUnboundError extends UnboundError {
    public override readonly code: AuthUnboundErrorCode;

    constructor(code: AuthUnboundErrorCode, message?: string) {
        super(code, message);
        this.name = "AuthUnboundError";
        this.code = code;
    }
}
