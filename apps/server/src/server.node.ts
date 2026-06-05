import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Hono } from "hono";
import type { Env } from "@unbound/types";

export function startNodeServer(app: Hono<{ Bindings: Env }>) {
    const root = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../public"
    );
    
    app.use("/*", serveStatic({ root }));
    
    const server = serve({
        fetch: app.fetch,
        port: Number(process.env.PORT ?? 8080),
    });
    
    console.log("Server is running on port:", (server.address() as any)?.port ?? "unknown");
}