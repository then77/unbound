export interface Env {
    SESSION_SECRET_KEY: string;
    JWK_PUBLIC_KEY: string;
    JWK_PRIVATE_KEY: string;

    APP_NAME?: string | null;
    SESSION_COOKIE_NAME?: string | null;
    SESSION_TTL?: `${number}` | null; // in seconds

    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    DISCORD_CLIENT_ID?: string;
    DISCORD_CLIENT_SECRET?: string;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Env {}
    }
}

export { };