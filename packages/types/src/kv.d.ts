// KV abstraction for cloudflare kv usage

export type KVPutOptions = { expirationTtl?: number; };

export interface KVStore {
    get<T = string>(key: string): Promise<T | null>;
    put(key: string, value: string, options?: KVPutOptions): Promise<void>;
    delete(key: string): Promise<void>;
};