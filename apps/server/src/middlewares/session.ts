import { createMiddleware } from "hono/factory";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

import Iron from "@hapi/iron";

import type { AppEnv } from "@unbound/server/server";
import type { Session, Flash } from "@unbound/types";

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // a week
const DEFAULT_SESSION_NAME = "unbound_session";

function getSessionTtl(value: string | null | undefined) {
    const ttlSeconds = value ? Number(value) : DEFAULT_SESSION_TTL_SECONDS;

    return Number.isFinite(ttlSeconds) && ttlSeconds > 0
        ? ttlSeconds
        : DEFAULT_SESSION_TTL_SECONDS;
}

export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
    const cookie = getCookie(
        c,
        c.env.SESSION_COOKIE_NAME ?? DEFAULT_SESSION_NAME,
    );

    let session: Session | null = null;
    let sessionDirty = false;
    let clearFlash: boolean = true;

    const sealOptions: Iron.SealOptions = {
        ...Iron.defaults,
        ttl: getSessionTtl(c.env.SESSION_TTL) * 1000,
    };

    if (cookie) {
        try {
            session = await Iron.unseal(
                cookie,
                c.env.SESSION_SECRET_KEY,
                sealOptions,
            );
        } catch {
            session = null;
        }
    }

    c.set("session", session);
    c.set("isLoggedIn", () => {
        const props: (keyof Session)[] = ["sub", "provider", "name", "email"];
        if (!session) return false;

        return props.every((key) => key in session! && session![key] != null);
    });

    c.set("setSession", async (data) => {
        const final = {
            ...(session ?? {}),
            ...data,
        };

        session = Object.values(final).some((value) => value != null)
            ? final
            : null;
        sessionDirty = true;
        c.set("session", session);
    });

    c.set("clearSession", () => {
        session = null;
        sessionDirty = true;
        c.set("session", session);
    });

    // Flash helper
    c.set("setFlash", async (flash: Flash) => {
        await c.get("setSession")({ flash });
        clearFlash = false;
    });

    await next();

    // Check if flash should be cleared. (not redirect and clear flash == true)
    if ((c.res.status < 300 || c.res.status >= 400) && clearFlash) {
        await c.get("setSession")({ flash: null });
    }

    // Check if session data has changed. Set new session cookie data if yes.
    if (!sessionDirty) return;
    if (!session) {
        deleteCookie(c, c.env.SESSION_COOKIE_NAME ?? DEFAULT_SESSION_NAME);
        return;
    }

    const sealed = await Iron.seal(
        session,
        c.env.SESSION_SECRET_KEY,
        sealOptions,
    );

    setCookie(c, c.env.SESSION_COOKIE_NAME ?? DEFAULT_SESSION_NAME, sealed, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: getSessionTtl(c.env.SESSION_TTL),
    });
});
