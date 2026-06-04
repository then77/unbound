export interface Env {
    SECRET_KEY: string;
    JWK_PUBLIC_KEY: string;
    JWK_PRIVATE_KEY: string;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Env {}
    }
}

export { };