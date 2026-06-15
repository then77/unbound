import type { UserProvider } from "@unbound/types";

export type OauthErrorType =
    | "MISSING_LOGIN_SESSION"
    | "INVALID_LOGIN_SESSION"
    | "ERROR_EXCHANGE"
    | "ERROR_REFRESH"
    | "ERROR_USERINFO"
    | "PROVIDER_UNAVAILABLE"
    | "OTHER";

export default class OauthError extends Error {
    public readonly provider: UserProvider;
    public readonly errorType: OauthErrorType;

    constructor(
        provider: UserProvider,
        errorType: OauthErrorType,
        message?: string,
    ) {
        super(message);
        this.name = "OauthError";
        this.provider = provider;
        this.errorType = errorType;
    }
}
