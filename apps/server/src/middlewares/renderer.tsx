import { jsxRenderer } from "hono/jsx-renderer";

import { Layout } from "@unbound/web/layout";

import type { Context } from "hono";
import type { AppEnv } from "@unbound/server/server";

// Patch for jsx render context to include title
declare module "hono" {
    interface ContextRenderer {
        (
            content: string | Promise<string>,
            props: {
                title: string;
                empty?: boolean;
                navbarState?: null | "show" | "hide";
            },
        ): Response;
    }
}

export const rendererMiddleware = jsxRenderer(
    ({ children, title, empty, navbarState }, c: Context<AppEnv>) => {
        const session = c.get("session");
        const appName =
            c.env.APP_NAME && c.env.APP_NAME != "" ? c.env.APP_NAME : "Unbound";

        // Specific env from ci/cd. If you self deploy yourself, you can
        // safely not use / delete this
        const gitCommit = (c.env as any).GIT_COMMIT ?? null;
        const nextVersion = (c.env as any).NEXT_VERSION
            ? Boolean((c.env as any).NEXT_VERSION)
            : false;

        return (
            <Layout
                appName={appName}
                title={title}
                session={session}
                empty={empty}
                navbarState={navbarState}
                gitCommit={gitCommit}
                nextVersion={nextVersion}
            >
                {children}
            </Layout>
        );
    },
);
