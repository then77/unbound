import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { App, AppEnv } from "@unbound/server/server";

export function startNodeServer(app: App) {
    dotenv.config();

    const root = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../public",
    );

    app.use("/*", serveStatic({ root }));

    const server = serve({
        fetch: (request, nodeBindings) =>
            app.fetch(request, {
                ...nodeBindings,
                ...process.env,
            } as AppEnv["Bindings"]),
        port: Number(process.env.PORT ?? 8080),
    });

    console.log(
        "Server is running on port:",
        (server.address() as any)?.port ?? "unknown",
    );
}
