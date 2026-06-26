import { createUnboundClient } from "@/index";
import type {
    UnboundClient,
    BrowserClientOptions as ClientBrowserOptions,
    Session,
} from "@/types";

const defaultClient = createUnboundClient({
    auto_redirect: true,
    redirect_to: "/",
});

/**
 * Ensure exported Unbound will have 1:1 exported functionality
 * as createUnboundClient with create addition. This is for
 * type check/lint only.
 */
type Client = ReturnType<typeof createUnboundClient>;
type ClientMethodKeys = {
    [K in keyof Client]: Client[K] extends (...args: any[]) => any ? K : never;
}[keyof Client];
type BrowserClientOptions<T extends ClientBrowserOptions> = Omit<
    { auto_redirect: true },
    keyof T
> &
    T;
type UnboundBrowserClient = {
    create: <T extends ClientBrowserOptions = ClientBrowserOptions>(
        opts?: T,
    ) => UnboundClient<BrowserClientOptions<T>>;
} & {
    [K in ClientMethodKeys]: Client[K];
} & {
    user: Session | null;
    config: Readonly<ClientBrowserOptions>;
};

const Unbound: UnboundBrowserClient = {
    create: <T extends ClientBrowserOptions = ClientBrowserOptions>(opts?: T) =>
        createUnboundClient({
            auto_redirect: true,
            redirect_to: "/",
            ...opts,
        } as BrowserClientOptions<T>) as UnboundClient<BrowserClientOptions<T>>,
    clone: defaultClient.clone.bind(defaultClient),
    initialize: defaultClient.initialize.bind(defaultClient),
    startSignIn: defaultClient.startSignIn.bind(defaultClient),
    finishSignIn: defaultClient.finishSignIn.bind(defaultClient),
    getSession: defaultClient.getSession.bind(defaultClient),
    setSession: defaultClient.setSession.bind(defaultClient),
    get user() {
        return defaultClient.user;
    },
    get config() {
        return defaultClient.config;
    },
    set config(newConfig) {
        defaultClient.config = newConfig;
    },
};

export default Unbound;
