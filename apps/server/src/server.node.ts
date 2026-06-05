import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { App, AppEnv } from "@unbound/server/server";

export function startNodeServer(app: App) {
    dotenv.config();

    const root = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../public",
    );

    const servePublic = serveStatic({ root });
    app.use("/*", async (context, next) => {
        // Exclude style from being cached served on dev
        if (process.env.NODE_ENV !== "production" && context.req.path === "/style.css") {
            try {
                const css = await readFile(path.join(root, "style.css"));

                return new Response(css, {
                    headers: {
                        "Content-Type": "text/css; charset=utf-8",
                        "Cache-Control": "no-cache"
                    },
                });
            } catch {
                return new Response("Not Found", { status: 404 });
            }
        }

        return servePublic(context, next);
    });

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
