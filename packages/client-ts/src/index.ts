import { createClient } from "@/client";

import type {
    ClientOptions,
    BrowserClientOptions,
    ServerClientOptionsWithRedirect,
    ServerClientOptionsWithoutRedirect,
    UnboundClient,
    ServerClientOptions,
} from "@/types";

/**
 * Creates an Unbound client for starting and finishing authentication flows.
 *
 * @param options - Client configuration options
 * @returns An Unbound client.
 */
export function createUnboundClient(): UnboundClient<{}>;
export function createUnboundClient(
    options: ClientOptions & {
        auto_redirect: true;
        server: true;
    } & {
        __error: "auto_redirect cannot be true when server is true";
    },
): UnboundClient<ClientOptions>; // magic type to keep jsdoc working when error
export function createUnboundClient(
    options: BrowserClientOptions,
): UnboundClient<BrowserClientOptions>;
export function createUnboundClient(
    options: ServerClientOptions,
): UnboundClient<ServerClientOptions>;
export function createUnboundClient(
    options: ServerClientOptionsWithRedirect,
): UnboundClient<ServerClientOptionsWithRedirect>;
export function createUnboundClient(
    options: ServerClientOptionsWithoutRedirect,
): UnboundClient<ServerClientOptionsWithoutRedirect>;
export function createUnboundClient(
    options?: ClientOptions,
): UnboundClient<ClientOptions> {
    return createClient(options ?? {});
}

export { UnboundError, APIUnboundError, AuthUnboundError } from "@/exceptions";
export type {
    Scope,
    Session,
    ClientOptions,
    UnboundClient,
    StartSignInOptions,
    StartSignInResult,
    FinishSignInOptions,
    FinishSignInResult,
    PublicJWK,
} from "@/types";