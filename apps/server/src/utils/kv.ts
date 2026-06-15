import ky, { type KyInstance } from "ky";

import type { Context } from "hono";
import type { AppEnv } from "@unbound/server/server";
import type { Env as UnboundEnv, KVStore, KVPutOptions } from "@unbound/types";

class ApiKV implements KVStore {
    private client: KyInstance;

    constructor(env: UnboundEnv) {
        this.client = ky.create({
            baseUrl: `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${env.CLOUDFLARE_KV_NAMESPACE_ID}/values`,

            headers: {
                Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
            },
        });
    }

    async get<T = string>(key: string): Promise<T | null> {
        const res = await this.client.get(key, {
            throwHttpErrors: false,
        });

        if (res.status === 404) {
            return null;
        }

        if (!res.ok) {
            throw new Error(`KV GET failed ${res.status}`);
        }

        return (await res.text()) as T;
    }

    async put(key: string, value: string, options?: KVPutOptions) {
        let path = key;

        if (options?.expirationTtl) {
            path += `?expiration_ttl=${options.expirationTtl}`;
        }

        const res = await this.client.put(path, {
            body: value,
        });

        if (!res.ok) {
            throw new Error(`KV PUT failed ${res.status}`);
        }
    }

    async delete(key: string) {
        const res = await this.client.delete(key);

        if (!res.ok) {
            throw new Error(`KV DELETE failed ${res.status}`);
        }
    }
}

export function getKV(c: Context<AppEnv>) {
    type EnvWithKV = typeof c.env & { KV?: KVStore | null };
    const env: EnvWithKV = c.env;

    if (
        env.CLOUDFLARE_ACCOUNT_ID &&
        env.CLOUDFLARE_API_TOKEN &&
        env.CLOUDFLARE_KV_NAMESPACE_ID
    ) {
        return new ApiKV(env);
    }

    // Fallback to KV binding if available
    if (env.KV) {
        return env.KV;
    }

    return null;
}
