export type OauthErrorType =
    | "MISSING_TOKEN"
    | "INVALID_TOKEN"
    | "EXPIRED_TOKEN"
    | "ERROR_GENERATE"
    | "ERROR_DECODE"
    | "OTHER";

export default class AuthorizeError extends Error {
    public readonly errorType: OauthErrorType;

    constructor(
        errorType: OauthErrorType,
        message?: string,
    ) {
        super(message);
        this.name = "AuthorizeError";
        this.errorType = errorType;
    }
}
