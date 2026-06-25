import type {
    APIUnboundError,
    AuthUnboundError,
    UnboundError,
} from "@/exceptions";

export type Scope = "openid" | "profile" | "email";

export type StorageAdapterKey =
    /* Key for access token */
    | "token"
    /* Key for login pkce verifier */
    | "verifier"
    /* Key for login state */
    | "state";

export interface StorageAdapter {
    get(key: StorageAdapterKey): Promise<string | null>;
    set(key: StorageAdapterKey, value: string): Promise<void>;
    remove(key: StorageAdapterKey): Promise<void>;
}

/**
 * Options used to configure an Unbound client.
 */
export interface ClientOptions {
    /**
     * Auth server URL.
     *
     * @defaultValue `"https://unbound.rlzy.me"`
     */
    auth_url?: string;

    /**
     * Default redirect URI used to receive the auth callback.
     *
     * Relative paths are resolved against the current browser origin. Absolute
     * URLs can be used in both browser and server environments.
     *
     * @example
     * ```ts
     * createUnboundClient({ redirect_uri: "/auth/callback" });
     * ```
     */
    redirect_uri?: string;

    /**
     * URL to automatically redirect to after `finishSignIn` completes successfully.
     *
     * Only works when `auto_redirect` is set to `true`. The client will navigate
     * to this URL after the authentication flow is complete.
     *
     * In server environments, this must NOT be configured as `auto_redirect` is
     * always disabled on the server.
     *
     * @example
     * ```ts
     * createUnboundClient({
     *   auto_redirect: true,
     *   redirect_to: "/dashboard"
     * });
     * ```
     */
    redirect_to?: string;

    /**
     * Scopes to request during authorization.
     *
     * Allowed values are `"openid"`, `"profile"`, and `"email"`.
     *
     * @defaultValue `["profile", "email"]`
     */
    scopes?: Scope[];

    /**
     * Whether this client runs in a server environment.
     *
     * This help updates the expected types and configure server-specific behaviour.
     * For example, `auto_redirect` is always disabled on the server.
     */
    server?: boolean;

    /**
     * Whether calls that require a redirect should automatically redirect the
     * browser, such as `startSignIn`.
     *
     * This also enables auto handle `finishSignIn` and redirect.
     *
     * In server environment, this always and must be disabled.
     */
    auto_redirect?: boolean;

    /**
     * Storage adapter used to persist the session and temporary login state,
     * such as PKCE and state values.
     */
    storage?: StorageAdapter;

    /**
     * Custom fetch implementation.
     *
     * Must be compatible with the global `fetch` API.
     */
    fetcher?: typeof fetch;

    advanced?: {
        endpoints?: {
            authorization?: string;
            token?: string;
            keys?: string;
        };
    };
}

export type BrowserClientOptions = ClientOptions & {
    server?: false;
};

export type ServerClientOptions = ClientOptions & {
    server: true;
    auto_redirect?: false | null;
    redirect_to?: null;
};

export type ServerClientOptionsWithRedirect = ServerClientOptions & {
    redirect_uri: string;
};
export type ServerClientOptionsWithoutRedirect = ServerClientOptions & {
    redirect_uri?: undefined;
};

export type ValidateClientOptions<T extends ClientOptions> = T extends {
    server: true;
}
    ? { auto_redirect?: false }
    : unknown;

export type MergeClientOptions<
    T extends ClientOptions,
    U extends ClientOptions,
> = Omit<T, keyof U> & U;

export type ClientState = {
    init: boolean;
    jwks: PublicJWK[] | null;
    state: State;
};

export type FunctionOptions<TOptions, TResult> = {} extends TOptions
    ? (opts?: TOptions) => TResult
    : (opts: TOptions) => TResult;

export type FunctionResult<T> =
    | {
          data: T;
          error: null;
      }
    | {
          data: null;
          error: AuthUnboundError | APIUnboundError | UnboundError | Error;
      };

export type RedirectUriOption<T extends ClientOptions> = T extends {
    server: true;
}
    ? T extends { redirect_uri: string }
        ? {
              /**
               * Redirect URI to receive the auth callback.
               *
               * Optional when already configured in client options.
               */
              redirect_uri?: string;
          }
        : {
              /**
               * Redirect URI to receive the auth callback.
               *
               * Required in server environments when not configured in client options.
               */
              redirect_uri: string;
          }
    : {
          /**
           * Redirect URI to receive the auth callback.
           *
           * Optional when already configured in client options.
           */
          redirect_uri?: string;
      };

export type AutoRedirectOption<T extends ClientOptions> = T extends {
    server: true;
}
    ? {
          /**
           * Whether to automatically redirect the browser.
           *
           * Always disabled in server environments.
           */
          auto_redirect?: undefined;
      }
    : {
          /**
           * Whether to automatically redirect the browser and handle the callback.
           */
          auto_redirect?: boolean;
      };

/**
 * Options for starting the sign-in flow.
 */
export type StartSignInOptions<T extends ClientOptions = ClientOptions> =
    RedirectUriOption<T> &
        AutoRedirectOption<T> & {
            /**
             * Scopes to request for this authorization attempt.
             *
             * Allowed values are `"openid"`, `"profile"`, and `"email"`.
             * Defaults to the client's configured scopes.
             */
            scopes?: Scope[];
        };

export interface StartSignInResult {
    url: string;
    state: string;
    challenge: string;
    verifier: string;
}

/**
 * Options for finishing the sign-in flow after receiving the auth callback.
 *
 * In server environments, `code` and `verifier` must be provided manually.
 * In browser environments, they can be read from the current URL and storage.
 */
export type FinishSignInOptions<T extends ClientOptions = ClientOptions> =
    RedirectUriOption<T> &
        AutoRedirectOption<T> & {
            /**
             * URL to redirect to after sign-in completes successfully.
             *
             * Only works when `auto_redirect` is set to `true`.
             */
            redirect_to?: string;
        } & (T extends { server: true }
            ? {
                  /** Authorization code returned by the auth server. */
                  code: string;
                  /** PKCE verifier created when starting sign-in. */
                  verifier: string;
                  /**
                   * URL to redirect to after sign-in completes successfully.
                   *
                   * Must be not configured in server environment.
                   */
                  redirect_to?: null | undefined;
              }
            : {
                  /** Authorization code returned by the auth server. */
                  code?: string;
                  /** PKCE verifier created when starting sign-in. */
                  verifier?: string;
              });

export interface FinishSignInResult {
    access_token: string;
    expires_in: number;
}

export type GetSessionOptions = {
    /**
     * Whether to verify the session token against the auth server's JWKs.
     *
     * When enabled, throws `AuthUnboundError` or `APIUnboundError` if verification fails.
     * 
     * Recommended and by default enabled on server environment.
     */
    verify?: boolean;
};

/**
 * Options for setting a new session.
 */
export type SetSessionOptions = {
    /** Access token to store and verify. */
    access_token: string;
} & GetSessionOptions;

/**
 * Unbound client interface for managing authentication flows.
 */
export interface UnboundClient<T extends ClientOptions = ClientOptions> {
    /**
     * Clone this client instance
     *
     * @param opts - Additional options to merge with the current configuration.
     * @returns A cloned client instance
     */
    clone: <U extends ClientOptions = {}>(
        opts?: ClientOptions & U & ValidateClientOptions<U>,
    ) => UnboundClient<MergeClientOptions<T, U>>;
    /**
     * Initializes the client by loading stored session and auth state.
     *
     * This is called automatically when calling other methods, but can be invoked manually
     * to preload the session state.
     */
    initialize: FunctionOptions<null, Promise<void>>;
    /**
     * Starts the sign-in flow by generating an authorization URL.
     *
     * @param opts - Sign-in options including redirect URI, scopes, and auto-redirect behavior.
     * @returns Authorization URL and PKCE parameters, or an error.
     *
     * @example
     * ```ts
     * const { data } = await client.startSignIn({ scopes: ['openid', 'profile'] });
     * if (data) {
     *   console.log('Redirect to:', data.url);
     * }
     * ```
     */
    startSignIn: FunctionOptions<
        StartSignInOptions<T>,
        Promise<FunctionResult<StartSignInResult>>
    >;
    /**
     * Completes the sign-in flow by exchanging the authorization code for a token.
     *
     * In browser environments with no code provided in options, this automatically
     * reads the code from the URL and validates the state parameter.
     *
     * @param opts - Options including authorization code, verifier, and redirect URI.
     * @returns Access token and expiration, or an error.
     *
     * @example
     * ```ts
     * // Browser with auto_redirect
     * const { data, error } = await client.finishSignIn();
     *
     * // Server environment
     * const { data, error } = await client.finishSignIn({
     *   code: 'auth_code',
     *   verifier: 'stored_verifier'
     * });
     * ```
     */
    finishSignIn: FunctionOptions<
        FinishSignInOptions<T>,
        Promise<FunctionResult<FinishSignInResult>>
    >;
    /**
     * Retrieves the current session.
     *
     * @param opts - Options including whether to verify the token.
     * @returns The current session, or `null` if not authenticated.
     *
     * @example
     * ```ts
     * // Get session without verification
     * const { data } = await client.getSession();
     *
     * // Get session with verification
     * const { data, error } = await client.getSession({ verify: true });
     * if (error) {
     *   console.error('Token invalid:', error);
     * }
     * ```
     */
    getSession: FunctionOptions<
        GetSessionOptions,
        Promise<FunctionResult<Session | null>>
    >;
    /**
     * Sets a new session by storing and optionally verifying a token.
     *
     * @param opts - Options including the access token and whether to verify it.
     * @returns The session derived from the token, or an error.
     *
     * @example
     * ```ts
     * const { data, error } = await client.setSession({
     *   access_token: 'token_from_somewhere',
     *   verify: true
     * });
     * ```
     */
    setSession: FunctionOptions<
        SetSessionOptions,
        Promise<FunctionResult<Session>>
    >;
    /**
     * Current authenticated user session from cached state.
     *
     * Returns `null` if not authenticated or if the client has not been initialized.
     * This is a synchronous getter that reflects the session state loaded by `initialize()`.
     *
     * Call `initialize()` first to ensure the session is loaded from storage.
     *
     * @example
     * ```ts
     * // May be null before initialization
     * console.log(client.user); // null
     *
     * await client.initialize();
     * if (client.user) {
     *   console.log('Logged in as:', client.user.user?.name);
     * }
     * ```
     */
    user: Session | null;
}

/**
 * Authenticated session returned by Unbound.
 */
export interface Session {
    /** Authenticated user profile, when available. */
    user?: {
        /** Unique user ID. */
        id: string;
        /** Display name. */
        name?: string;
        /** Profile picture URL. */
        picture?: string;
        /** Email address. */
        email?: string;
        /** Whether the email address has been verified. */
        email_verified?: boolean;
    };
    /** Access token for authenticated requests. */
    access_token: string;
    /** Number of seconds until the access token expires. */
    expires_in?: number;
}

export interface State {
    session: Session | null;
    verifier: string | null;
    state: string | null;
}

type JWKBase = {
    kid: string;
};

type RSAPublicJWK = JWKBase & {
    kty: "RSA";
    n: string;
    e: string;
};

type ECPublicJWK = JWKBase & {
    kty: "EC";

    crv: "P-256" | "P-384" | "P-521" | "secp256k1";

    x: string;
    y: string;
};

type OKPPublicJWK = JWKBase & {
    kty: "OKP";
    crv: "Ed25519" | "Ed448" | "X25519" | "X448";
    x: string;
};

export type PublicJWK = RSAPublicJWK | ECPublicJWK | OKPPublicJWK;
