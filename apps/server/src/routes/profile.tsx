import { Hono } from "hono";

import { ProfilePage } from "@unbound/web/pages/profile";

import type { AppEnv } from "@unbound/server";

const app = new Hono<AppEnv>();

app.get("/profile", async (c) => {
    if (!c.get("isLoggedIn")()) {
        await c.get("setFlash")({
            id: "profile",
            type: "info",
            message: "Please login first to continue.",
        });

        return c.redirect("/login");
    }

    const session = c.get("session")!;
    return c.render(<ProfilePage session={session} />, {
        title: `Profile`,
        navbarState: "hide",
    });
});

app.post("/logout", async (c) => {
    const setFlash = c.get("setFlash");
    if (!c.get("isLoggedIn")()) {
        await setFlash({
            id: "logout",
            type: "error",
            message: "You're not logged in.",
        });
        return c.redirect("/login");
    }

    c.get("clearSession")();
    await setFlash({
        id: "logout",
        type: "success",
        message: "Successfully logged out.",
    });
    return c.redirect("/");
});

export default app;
