import { Hono } from "hono";
import { getRuntimeKey } from "hono/adapter";

import { setupMiddleware } from "@unbound/server/middlewares/setup";
import { sessionMiddleware } from "@unbound/server/middlewares/session";

import openIdRoutes from "@unbound/server/routes/openid";

import { Layout } from "@unbound/web/layout";

import type { Env, SessionVariables } from "@unbound/types";

type Variables = SessionVariables;
export type AppEnv = { Bindings: Env; Variables: Variables };

const app = new Hono<AppEnv>();
export type App = typeof app;

app.use("*", setupMiddleware);
app.use("*", sessionMiddleware);

app.get("/", (c) => {
    const loggedIn = c.get("isLoggedIn");
    const session = c.get("session");

    return c.html(
        <Layout title="Home">
            <h1>Unbound dev. Timestamp: {Date.now()}</h1>
            <p>Logged in?: {loggedIn() ? "true" : "false"}</p>
            {session ? (
                <p>
                    As: {session.name} ({session.email}).
                    <a href="/make-me-logout">Click to logout</a>
                </p>
            ) : (
                <a href="/make-me-login">Click to login</a>
            )}
        </Layout>,
    );
});

app.route("/", openIdRoutes);

// Dev only
app.get("/make-me-login", async (c) => {
    const setSession = c.get("setSession");
    await setSession({
        sub: "6767676767676767",
        provider: "google",
        name: "Six Seven",
        email: "67@sixseven.ceo",
        timestamp: Date.now(),
    });

    return c.redirect("/");
});
app.get("/make-me-logout", async (c) => {
    const clearSession = c.get("clearSession");
    clearSession();

    return c.redirect("/");
});

export default app;

// Run a webserver on node environment
if (getRuntimeKey() == "node") {
    import("@unbound/server/server.node").then((s) => s.startNodeServer(app));
}
