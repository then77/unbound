export interface Env {
    SESSION_SECRET_KEY: string;
    JWK_PUBLIC_KEY: string;
    JWK_PRIVATE_KEY: string;

    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    DISCORD_CLIENT_ID?: string;
    DISCORD_CLIENT_SECRET?: string;

    CLOUDFLARE_ACCOUNT_ID?: string;
    CLOUDFLARE_API_TOKEN?: string;
    CLOUDFLARE_KV_NAMESPACE_ID?: string;

    APP_NAME?: string | null;
    SESSION_COOKIE_NAME?: string | null;
    SESSION_TTL?: `${number}` | null; // in seconds
    AUTHORIZE_CODE_EXPIRATION?: `${number}` | null; // in seconds
    AUTHORIZE_CODE_KV_TTL?: `${number}` | null; // in seconds
    AUTHORIZE_TOKEN_EXPIRATION?: `${number}` | null; // in seconds
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Env {}
    }
}

export { };