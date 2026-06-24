import { isBrowser } from "@/utils";
import type { ClientOptions, StartSignInOptions } from "@/types";

const defaultClientOptions: ClientOptions = {
    auth_url: "https://unbound.rlzy.me",
    scopes: ["profile", "email"],
    advanced: {
        endpoints: {
            authorization: "/authorize",
            token: "/token",
            keys: "/.well-known/jwks.json"
        }
    }
}

export function createUnboundClient(options?: ClientOptions) {
    const opts = { ...defaultClientOptions, options };

    // return {
    //     ...
    // }
}
