export type Scope = "openid" | "profile" | "email";

export interface ClientOptions {
    auth_url?: string;
    redirect_uri?: string;
    scopes?: Scope[];
    fetcher?: typeof fetch;
    advanced?: {
        endpoints?: {
            authorization?: string;
            token?: string;
            keys?: string;
        }
    }
}

export interface StartSignInOptions {
    redirect_uri?: string;
    scopes?: Scope[];
}

export interface StartSignInResult {
    url: string;
    verifier: string;
}

export interface FinishSignInOptions {
    code?: string;
    redirect_uri?: string;
    verifier?: string;
}

export interface FinishSignInResult {
    access_token: string;
    expires_in: number;
}

export interface SessionResult {
    user: {
        id: string;
        name?: string;
        picture?: string;
        email?: string;
        email_verified?: boolean;
    },
    access_token: string;
    expires_in: string;
}