import { Hono } from "hono";

import { getRuntimeKey } from "hono/adapter";

import { rendererMiddleware } from "@unbound/server/middlewares/renderer";
import { setupMiddleware } from "@unbound/server/middlewares/setup";
import { sessionMiddleware } from "@unbound/server/middlewares/session";

import openIdRoutes from "@unbound/server/routes/openid";
import loginRoutes from "@unbound/server/routes/login";
import authorizeRoutes from "@unbound/server/routes/authorize";

import type { Env, SessionVariables } from "@unbound/types";

type Variables = SessionVariables;
export type AppEnv = { Bindings: Env; Variables: Variables };

const app = new Hono<AppEnv>();
export type App = typeof app;

// Patch for jsx render context to include title
declare module "hono" {
    interface ContextRenderer {
        (
            content: string | Promise<string>,
            props: {
                title: string;
                empty?: boolean;
            },
        ): Response;
    }
}

app.use("*", rendererMiddleware);
app.use("*", setupMiddleware);
app.use("*", sessionMiddleware);

app.get("/", (c) => {
    const loggedIn = c.get("isLoggedIn");
    const session = c.get("session");

    return c.render(
        <>
            <h1>Unbound dev. Timestamp: {Date.now()}</h1>
            <p>Logged in?: {loggedIn() ? "true" : "false"}</p>
            {loggedIn() ? (
                <p>
                    As: {session!.name} ({session!.email}).
                    <form action="/logout" method="post">
                        <a href="/logout" onclick="event.preventDefault();this.closest('form').submit();">Click to logout</a>
                    </form>
                </p>
            ) : (
                <a href="/login?redirect_to=/">Click to login</a>
            )}
        </>,
        { title: "Home" },
    );
});

app.route("/", openIdRoutes);
app.route("/", loginRoutes);
app.route("/", authorizeRoutes);

export default app;

// Run a webserver on node environment
if (getRuntimeKey() == "node") {
    import("@unbound/server/server.node").then((s) => s.startNodeServer(app));
}
