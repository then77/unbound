import { browserStorageAdapter } from "@/adapters/browser";
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
    StorageAdapterBatch,
    StorageAdapterKey,
    AuthEvents,
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

    let _init = state?.init ?? false;
    let _expiration: NodeJS.Timeout | null = null;
    let _listeners: {
        [K in keyof AuthEvents]?: Set<(payload: AuthEvents[K]) => void>;
    } = {};
    const _state: State = state
        ? { ...state.state }
        : {
              session: null,
              verifier: null,
              state: null,
          };

    function getStorage(): StorageAdapterBatch {
        const storage = clientOpts.storage!;
        return {
            query: async (keys) => {
                // Use batch query if available, otherwise fall back to individual gets
                if (storage.query) {
                    return storage.query(keys);
                }

                const result: Partial<
                    Record<StorageAdapterKey, string | null>
                > = {};
                for (const key of keys) {
                    result[key] = await storage.get(key);
                }
                return result;
            },
            mutate: async (values) => {
                // Use batch mutate if available, otherwise fall back to individual set/remove
                if (storage.mutate) {
                    return storage.mutate(values);
                }

                for (const [key, value] of Object.entries(values) as [
                    StorageAdapterKey,
                    string | null,
                ][]) {
                    if (value === null) {
                        await storage.remove(key);
                    } else {
                        await storage.set(key, value);
                    }
                }
            },
        };
    }

    function emit<K extends keyof AuthEvents>(
        event: K,
        payload: AuthEvents[K],
    ) {
        _listeners[event]?.forEach((cb) => cb(payload));
    }

    function clearLogoutTimer() {
        if (_expiration) {
            clearTimeout(_expiration);
            _expiration = null;
        }
    }

    function scheduleLogoutTimer(expiresIn: number) {
        if (clientOpts.server || !isBrowser()) return;
        clearLogoutTimer();
        _expiration = setTimeout(async () => {
            _expiration = null;
            _state.session = null;

            const storage = getStorage();
            await storage.mutate({ token: null });

            emit("logout", { reason: "expired" });
        }, expiresIn * 1000);
    }

    async function verifyToken(token: string, check?: boolean) {
        const shouldCheck = check ?? clientOpts.server;
        const hadSession = !!_state.session;

        try {
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
        } catch (error) {
            _state.session = null;

            clearLogoutTimer();

            if (hadSession && _init) {
                const reason =
                    error instanceof AuthUnboundError &&
                    error.code === "EXPIRED_TOKEN"
                        ? "expired"
                        : "revoked";
                emit("logout", { reason });
            }

            throw error;
        }
    }

    async function initialize() {
        if (_init) return;

        const storage = getStorage();
        const data = await storage.query(["verifier", "state", "token"]);

        _state.verifier ??= data.verifier ?? null;
        _state.state ??= data.state ?? null;

        const token = _state.session?.access_token ?? data.token ?? null;
        if (token && !_state.session) {
            try {
                await verifyToken(token);
            } catch {}
        }

        if (_state.session?.expires_at) {
            const remaining =
                _state.session.expires_at - Math.floor(Date.now() / 1000);
            if (remaining > 0) {
                scheduleLogoutTimer(remaining);
            }
        }

        emit("ready", { session: _state.session });
        _init = true;
    }

    const clone = (<U extends ClientOptions = {}>(
        opts?: ClientOptions & U & ValidateClientOptions<U>,
    ) =>
        createClient<MergeClientOptions<T, U>>(
            { ...clientOpts, ...opts } as unknown as MergeClientOptions<T, U>,
            { init: _init, state: _state },
        )) as UnboundClient<T>["clone"];

    const on = <K extends keyof AuthEvents>(
        event: K,
        callback: (payload: AuthEvents[K]) => void,
    ) => {
        const listeners =
            _listeners[event] ??
            (_listeners[event] = new Set() as NonNullable<
                (typeof _listeners)[K]
            >);

        listeners.add(callback);
    };

    const off = <K extends keyof AuthEvents>(
        event: K,
        callback: (payload: AuthEvents[K]) => void,
    ) => {
        _listeners[event]?.delete(
            callback as (payload: AuthEvents[keyof AuthEvents]) => void,
        );
    };

    const client = {
        clone,
        on,
        off,
        initialize,
        get user(): Session | null {
            if (!_state.session) return null;
            if (!_state.session.expires_at) return _state.session;
            return {
                ..._state.session,
                expires_in: Math.max(
                    0,
                    _state.session.expires_at - Math.floor(Date.now() / 1000),
                ),
            };
        },
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

                const storage = getStorage();

                _state.state = state;
                _state.verifier = verifier;
                await storage.mutate({
                    state,
                    verifier,
                });

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
                    if (
                        clientOpts.auto_redirect &&
                        redirectTo &&
                        !clientOpts.server &&
                        isBrowser()
                    ) {
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
                    const { access_token } = await exchangeCode(
                        {
                            code,
                            redirectUri,
                            verifier,
                        },
                        clientOpts.auth_url!,
                        clientOpts.advanced?.endpoints?.token,
                        clientOpts?.fetcher,
                    );

                    const storage = getStorage();

                    _state.state = null;
                    _state.verifier = null;
                    await verifyToken(access_token);
                    await storage.mutate({
                        state: null,
                        verifier: null,
                        token: access_token,
                    });

                    const session = _state.session!;
                    if (session.expires_at) {
                        session.expires_in = Math.max(
                            0,
                            session.expires_at - Math.floor(Date.now() / 1000),
                        );

                        const remaining =
                            session.expires_at - Math.floor(Date.now() / 1000);
                        if (remaining > 0) {
                            scheduleLogoutTimer(remaining);
                        }
                    }

                    emit("auth", { session });

                    if (redirectTo && !clientOpts.server && isBrowser()) {
                        window.location.replace(redirectTo);
                    }

                    return ok(session);
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
                await verifyToken(_state.session.access_token, opts?.verify);

                const session = _state.session;
                if (session.expires_at) {
                    session.expires_in = Math.max(
                        0,
                        session.expires_at - Math.floor(Date.now() / 1000),
                    );
                }

                return ok(session);
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

                const storage = getStorage();

                await verifyToken(token, opts.verify ?? false);
                await storage.mutate({
                    token,
                });

                if (!_state.session) {
                    return fail(new AuthUnboundError("INVALID_TOKEN"));
                }

                const session = _state.session;
                if (session.expires_at) {
                    session.expires_in = Math.max(
                        0,
                        session.expires_at - Math.floor(Date.now() / 1000),
                    );

                    const remaining =
                        session.expires_at - Math.floor(Date.now() / 1000);
                    if (remaining > 0) {
                        scheduleLogoutTimer(remaining);
                    }
                }

                return ok(session);
            } catch (error) {
                return fail(error as Error);
            }
        },
        logout: async () => {
            try {
                await initialize();

                if (!_state.session) return ok(null);

                const storage = getStorage();

                _state.session = null;
                clearLogoutTimer();
                await storage.mutate({
                    token: null,
                });

                emit("logout", { reason: "user" });
                return ok(null);
            } catch (error) {
                return fail(error as Error);
            }
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

    if (!clientOpts.server && isBrowser()) {
        // In browser environment, auto initialize
        initialize();

        // Also auto handle finish sign in
        setTimeout(() => {
            if (clientOpts.auto_redirect && clientOpts.redirect_to) {
                preCheckFinishSignIn();
            }
        }, 50);
    }

    return client;
}
