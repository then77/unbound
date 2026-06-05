export interface Env {
    SESSION_SECRET_KEY: string;
    JWK_PUBLIC_KEY: string;
    JWK_PRIVATE_KEY: string;

    APP_NAME?: string | null;
    SESSION_COOKIE_NAME?: string | null;
    SESSION_TTL?: `${number}` | null; // in seconds
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Env {}
    }
}

export { };