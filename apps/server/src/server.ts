import { Hono } from "hono";
import { getRuntimeKey } from "hono/adapter";
import type { Env } from "@unbound/types";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

export default app;

if (getRuntimeKey() === "node") {
    // On node.js runtime, serve the Hono app as a web server
    import("@hono/node-server")
        .then(({ serve }) => serve({
            fetch: app.fetch,
            port: Number(process.env.PORT ?? 8080),
        }))
        .then(server => {
            const address = server.address();
            const port = address == null ? "unknown" : typeof address == "string" ? address : address.port;
            console.log(`Server is running on port: ${port}`);
        })
        .catch(err => console.error("Failed to start server:", err));
}
