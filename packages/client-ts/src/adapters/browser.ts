import { isBrowser } from "@/utils";
import type { StorageAdapter, StorageAdapterKey } from "@/types";

/**
 * Options for the browser storage adapter.
 */
export interface BrowserStorageProps {
    /**
     * Prefix added to all storage keys.
     *
     * @defaultValue `"unbound_"`
     */
    prefix?: string;
}

/**
 * Creates a browser storage adapter for persisting Unbound auth state.
 *
 * The access token is stored in `localStorage`, while temporary sign-in values
 * such as PKCE and state are stored in `sessionStorage`.
 *
 * @param options - Browser storage adapter options.
 * @returns A storage adapter backed by browser storage.
 */
export function browserStorageAdapter(
    options?: BrowserStorageProps,
): StorageAdapter {
    const prefix = options?.prefix ?? "unbound_";
    const storage = (key: StorageAdapterKey) =>
        key == "token" ? localStorage : sessionStorage;

    return {
        get: async (key) => {
            if (!isBrowser()) return null;
            return storage(key).getItem(`${prefix}${key}`);
        },
        set: async (key, value) => {
            if (!isBrowser()) return;
            storage(key).setItem(`${prefix}${key}`, value);
        },
        remove: async (key) => {
            if (!isBrowser()) return;
            return storage(key).removeItem(`${prefix}${key}`);
        },
    };
}
