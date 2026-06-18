import { Hono } from "hono";

import { getRuntimeKey } from "hono/adapter";

import { rendererMiddleware } from "@unbound/server/middlewares/renderer";
import { setupMiddleware } from "@unbound/server/middlewares/setup";
import { sessionMiddleware } from "@unbound/server/middlewares/session";

import { ErrorPage, NotFoundPage } from "@unbound/web/pages/error";

import homeRoutes from "@unbound/server/routes/home";
import openIdRoutes from "@unbound/server/routes/openid";
import loginRoutes from "@unbound/server/routes/login";
import profileRoutes from "@unbound/server/routes/profile";
import authorizeRoutes from "@unbound/server/routes/authorize";

import type { Env as UnboundEnv, SessionVariables } from "@unbound/types";

type Variables = SessionVariables;
type FinalEnv = Omit<Env, keyof UnboundEnv> & UnboundEnv;
export type AppEnv = { Bindings: FinalEnv; Variables: Variables };

const app = new Hono<AppEnv>();
export type App = typeof app;

app.use("*", rendererMiddleware);
app.use("*", setupMiddleware);
app.use("*", sessionMiddleware);

app.route("/", homeRoutes);
app.route("/", openIdRoutes);
app.route("/", loginRoutes);
app.route("/", profileRoutes);
app.route("/", authorizeRoutes);

app.notFound(async (c) => {
    return c.render(<NotFoundPage />, { title: "404" });
})

app.onError(async (_, c) => {
    return c.render(
        <ErrorPage showRetry={true}>
            An error occurred while processing this request. Please try again
            later.
        </ErrorPage>,
        {
            title: "Oops!",
        },
    );
});

export default app;

// Run a webserver on node/bun environment
if (getRuntimeKey() == "node" || getRuntimeKey() == "bun") {
    import("@unbound/server/server.node").then((s) => s.startNodeServer(app));
}
