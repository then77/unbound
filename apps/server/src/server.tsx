import { Hono } from "hono";
import { getRuntimeKey } from "hono/adapter";

import Layout from "@unbound/web/layout";

import type { Env } from "@unbound/types";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
    return c.html(
        <Layout title="Home">
            <h1>Unbound dev. Timestamp: {Date.now()}</h1>
        </Layout>
    )
});

export default app;

// Run a webserver on node environment
if (getRuntimeKey() == "node") {
    import("@unbound/server/server.node")
        .then(s => s.startNodeServer(app))
}