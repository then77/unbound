import { browserStorageAdapter } from "@/adapters";
import { fetchJWKS, verifyJWT, getSessionFromJWT } from "@/utils/auth";
import { AuthUnboundError } from "@/exceptions";
import { ok, fail, getRedirectUri } from "@/utils";

import type {
    State,
    ClientOptions,
    ValidateClientOptions,
    MergeClientOptions,
    ClientState,
    UnboundClient,
    FinishSignInOptions,
    FinishSignInResult,
    StartSignInOptions,
    StartSignInResult,
    PublicJWK,
} from "@/types";

const defaultClientOptions: ClientOptions = {
    auth_url: "https://unbound.rlzy.me",
    scopes: ["profile", "email"],
    storage: browserStorageAdapter(),
    advanced: {
        endpoints: {
            authorization: "/authorize",
            token: "/token",
            keys: "/.well-known/jwks.json",
        },
    },
};

export function createClient<T extends ClientOptions>(
    options: T,
    state?: ClientState,
): UnboundClient<T> {
    const clientOpts = { ...defaultClientOptions, ...options };

    const storage = clientOpts.storage!;
    let _init = state?.init ?? false;
    let _jwks: PublicJWK[] | null = null;
    const _state: State = state
        ? { ...state.state }
        : {
              session: null,
              verifier: null,
              state: null,
          };

    async function initialize() {
        if (_init) return;

        _state.verifier ??= await storage?.get("verifier");
        _state.state ??= await storage?.get("state");
        
        const token = _state.session?.access_token ?? (await storage?.get("token"));
        if (token && !_state.session) {
            if (!clientOpts.server) {
                _state.session = getSessionFromJWT(token);
            } else {
                _jwks ??= await fetchJWKS(
                    clientOpts.auth_url!,
                    clientOpts.advanced?.endpoints?.keys,
                    clientOpts.fetcher,
                );

                if (_jwks && (await verifyJWT(token, _jwks))) {
                    _state.session = getSessionFromJWT(token);
                }
            }
        }
        _init = true;
    }

    const clone = (<U extends ClientOptions = {}>(
        opts?: ClientOptions & U & ValidateClientOptions<U>,
    ) =>
        createClient<MergeClientOptions<T, U>>(
            { ...clientOpts, ...opts } as unknown as MergeClientOptions<T, U>,
            { init: _init, jwks: _jwks, state: _state },
        )) as UnboundClient<T>["clone"];

    return {
        clone,
        startSignIn: async (opts?: StartSignInOptions<T>) => {
            await initialize();
            const redirectUri = getRedirectUri(
                opts?.redirect_uri ?? clientOpts?.redirect_uri ?? null,
            );
            const scopes = (opts?.scopes ?? clientOpts?.scopes ?? []).filter(
                (v) => ["openid", "profile", "email"].includes(v),
            );

            if (!redirectUri) {
                return fail(new AuthUnboundError("MISSING_REDIRECT_URI"));
            }
            if (!scopes || scopes.length == 0) {
                return fail(new AuthUnboundError("MISSING_SCOPES"));
            }

            return ok(null as unknown as StartSignInResult);
        },
        finishSignIn: (opts?: FinishSignInOptions<T>) => {
            console.log(opts);
            return ok(null as unknown as FinishSignInResult);
        },
    };
}
