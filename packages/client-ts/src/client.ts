import { browserStorageAdapter } from "@/adapters";
import {
    getUserInfo,
    getSessionFromJWT,
    generateAuthUrl,
    exchangeCode,
} from "@/utils/auth";
import { AuthUnboundError, UnboundError } from "@/exceptions";
import { generatePKCE, generateRandomString } from "@/utils/generate";
import { ok, fail, getRedirectUri, isBrowser } from "@/utils";

import type {
    State,
    ClientOptions,
    ValidateClientOptions,
    MergeClientOptions,
    ClientState,
    UnboundClient,
    FinishSignInOptions,
    StartSignInOptions,
    Session,
    GetSessionOptions,
    SetSessionOptions,
} from "@/types";

const defaultClientOptions: ClientOptions = {
    auth_url: "https://unbound.rlzy.me",
    scopes: ["profile", "email"],
    storage: browserStorageAdapter(),
    advanced: {
        endpoints: {
            authorization: "/authorize",
            token: "/token",
            userinfo: "/userinfo",
        },
    },
};

export function createClient<T extends ClientOptions>(
    options: T,
    state?: ClientState,
): UnboundClient<T> {
    let clientOpts = { ...defaultClientOptions, ...options };

    const storage = clientOpts.storage!;
    let _init = state?.init ?? false;
    const _state: State = state
        ? { ...state.state }
        : {
              session: null,
              verifier: null,
              state: null,
          };

    async function verifyToken(token: string, check?: boolean) {
        // check: undefined = default (check on server, skip on browser)
        // check: true = force check
        // check: false = skip check
        const shouldCheck = check ?? clientOpts.server;

        if (!shouldCheck) {
            _state.session = getSessionFromJWT(token);
        } else {
            const user = await getUserInfo(
                token,
                clientOpts.auth_url!,
                clientOpts.advanced?.endpoints?.userinfo,
                clientOpts.fetcher,
            );

            const session = getSessionFromJWT(token);
            session.user = user;
            _state.session = session;
        }
    }

    async function initialize() {
        if (_init) return;

        _state.verifier ??= await storage?.get("verifier");
        _state.state ??= await storage?.get("state");

        const token =
            _state.session?.access_token ?? (await storage?.get("token"));
        if (token && !_state.session) {
            try {
                await verifyToken(token);
            } catch {}
        }
        _init = true;
    }

    const clone = (<U extends ClientOptions = {}>(
        opts?: ClientOptions & U & ValidateClientOptions<U>,
    ) =>
        createClient<MergeClientOptions<T, U>>(
            { ...clientOpts, ...opts } as unknown as MergeClientOptions<T, U>,
            { init: _init, state: _state },
        )) as UnboundClient<T>["clone"];

    const client = {
        clone,
        initialize,
        get config(): Readonly<T> {
            return clientOpts as T;
        },
        set config(newConfig: Partial<T>) {
            clientOpts = { ...clientOpts, ...newConfig } as typeof clientOpts;
        },
        startSignIn: async (opts?: StartSignInOptions<T>) => {
            try {
                await initialize();
                const redirectUri = getRedirectUri(
                    opts?.redirect_uri ?? clientOpts?.redirect_uri ?? null,
                );
                const scopes = (
                    opts?.scopes ??
                    clientOpts?.scopes ??
                    []
                ).filter((v) => ["openid", "profile", "email"].includes(v));
                const autoRedirect =
                    opts?.auto_redirect ?? clientOpts.auto_redirect;

                if (!redirectUri) {
                    return fail(new AuthUnboundError("MISSING_REDIRECT_URI"));
                }
                if (!scopes || scopes.length == 0) {
                    return fail(new AuthUnboundError("MISSING_SCOPES"));
                }

                const state = generateRandomString();
                const { challenge, verifier } = await generatePKCE();

                _state.state = state;
                _state.verifier = verifier;
                await storage.set("state", state);
                await storage.set("verifier", verifier);

                const url = generateAuthUrl(
                    {
                        redirect_uri: redirectUri,
                        scopes,
                        challenge,
                        state,
                    },
                    clientOpts.auth_url!,
                    clientOpts.advanced?.endpoints?.authorization,
                );

                if (autoRedirect && !clientOpts.server && isBrowser()) {
                    window.location.href = url;
                }

                return ok({
                    url: url,
                    state,
                    challenge,
                    verifier,
                });
            } catch (error) {
                return fail(error as Error);
            }
        },
        finishSignIn: async (opts?: FinishSignInOptions<T>) => {
            try {
                await initialize();
                const redirectUri = getRedirectUri(
                    opts?.redirect_uri ?? clientOpts?.redirect_uri ?? null,
                );
                const redirectTo = getRedirectUri(
                    opts?.redirect_to ?? clientOpts.redirect_to ?? null,
                );

                const wrappedFail = (error: Parameters<typeof fail>[0]) => {
                    if (redirectTo && !clientOpts.server && isBrowser()) {
                        const url = new URL(redirectTo);
                        if (error instanceof UnboundError) {
                            url.searchParams.set(
                                "error",
                                error.code.toLowerCase(),
                            );
                        } else url.searchParams.set("error", "unknown");
                        window.location.replace(url.toString());
                    }
                    return fail(error);
                };

                if (!redirectUri) {
                    return wrappedFail(
                        new AuthUnboundError("MISSING_REDIRECT_URI"),
                    );
                }

                let code: string | null = opts?.code ?? null;
                let verifier: string | null = opts?.verifier ?? _state.verifier;

                if (!code && !clientOpts.server && isBrowser()) {
                    // Assume auto handle
                    const params = new URLSearchParams(window.location.search);
                    const state = params.get("state");
                    code = params.get("code");

                    if (!state) {
                        return wrappedFail(
                            new AuthUnboundError("MISSING_STATE"),
                        );
                    }
                    if (!_state.state || state != _state.state) {
                        return wrappedFail(
                            new AuthUnboundError("INVALID_STATE"),
                        );
                    }
                }

                if (!code) {
                    return wrappedFail(new AuthUnboundError("MISSING_CODE"));
                }

                if (!verifier) {
                    return wrappedFail(
                        new AuthUnboundError("MISSING_VERIFIER"),
                    );
                }

                try {
                    const { access_token, expires_in } = await exchangeCode(
                        {
                            code,
                            redirectUri,
                            verifier,
                        },
                        clientOpts.auth_url!,
                        clientOpts.advanced?.endpoints?.token,
                        clientOpts?.fetcher,
                    );

                    _state.state = null;
                    _state.verifier = null;
                    await storage.remove("state");
                    await storage.remove("verifier");
                    await verifyToken(access_token);
                    await storage.set("token", access_token);

                    if (redirectTo && !clientOpts.server && isBrowser()) {
                        window.location.replace(redirectTo);
                    }
                    return ok({
                        access_token,
                        expires_in,
                    });
                } catch (error) {
                    return wrappedFail(error as Error);
                }
            } catch (error) {
                return fail(error as Error);
            }
        },
        getSession: async (opts?: GetSessionOptions) => {
            try {
                await initialize();

                if (!_state.session) return ok(null);
                await verifyToken(
                    _state.session.access_token,
                    opts?.verify ?? false,
                );

                return ok(_state.session);
            } catch (error) {
                return fail(error as Error);
            }
        },
        setSession: async (opts: SetSessionOptions) => {
            try {
                await initialize();
                const token = opts.access_token;

                if (!token) {
                    return fail(new AuthUnboundError("MISSING_TOKEN"));
                }

                await verifyToken(token, opts.verify ?? false);
                await storage.set("token", token);

                if (!_state.session) {
                    return fail(new AuthUnboundError("INVALID_TOKEN"));
                }

                return ok(_state.session);
            } catch (error) {
                return fail(error as Error);
            }
        },
        get user(): Session | null {
            return _state.session;
        },
    };

    // Auto handle finish sign in
    const preCheckFinishSignIn = () => {
        const redirectUri = getRedirectUri(clientOpts?.redirect_uri ?? null);
        if (!redirectUri) return;

        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(redirectUri);

        if (
            currentUrl.origin !== targetUrl.origin ||
            currentUrl.pathname !== targetUrl.pathname
        ) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const state = params.get("state");
        const code = params.get("code");

        if (code && state) {
            void (async () => {
                try {
                    await client.finishSignIn();
                } catch {}
            })();
        }
    };

    setTimeout(() => {
        if (
            clientOpts.auto_redirect &&
            clientOpts.redirect_to &&
            !clientOpts.server &&
            isBrowser()
        ) {
            preCheckFinishSignIn();
        }
    }, 50);

    return client;
}
