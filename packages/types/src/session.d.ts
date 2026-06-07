export type UserProvider = "google" | "github" | "discord";

export interface User {
    sub?: string;
    provider?: UserProvider;
    name?: string;
    picture?: string;
    email?: string;
    email_verified?: boolean;
}

export interface Flash {
    id: string;
    type: "info" | "success" | "warn" | "error";
    message?: string;
    sticky?: boolean;
    dismissable?: boolean;
}

export type Session = User & {
    // Time when this session was successfully created
    timestamp?: number | null;

    // Account refresh token for refetch user profile later
    account_refresh_token?: string | null;

    // For session flash (ex. toast)
    flash?: Flash | null;

    // For temporary store login flow info
    login_redirect?: string | null;
    login_method?: string | null;
    login_verifier?: string | null;
};

export type SessionVariables = {
    session: Session | null;
    isLoggedIn: () => boolean;
    setSession: (session: Partial<Session>) => Promise<void>;
    clearSession: () => void;
    setFlash: (flash: Flash) => Promise<void>;
};
