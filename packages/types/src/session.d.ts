export interface Session {
    sub?: string;
    provider?: "google" | "github" | "discord";
    name?: string;
    email?: string;
    email_verified?: boolean;
    timestamp?: number;

    // For account info refresh
    account_refresh_token?: string | null;

    // For session flash (ex. toast)
    flash?: { id: string; message?: string, sticky?: boolean; dismissable?: boolean; } | null;

    // For temporary store redirect for login
    redirect?: string;
}

export type SessionVariables = {
    session: Session | null;
    isLoggedIn: () => boolean;
    setSession: (session: Partial<Session>) => Promise<void>
    clearSession: () => void;
}