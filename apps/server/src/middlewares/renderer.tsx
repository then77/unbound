import { jsxRenderer } from "hono/jsx-renderer";

import { Layout } from "@unbound/web/layout";

// Patch for jsx render context to include title
declare module "hono" {
    interface ContextRenderer {
        (
            content: string | Promise<string>,
            props: {
                title: string;
                empty?: boolean;
                isHomePage?: boolean;
            },
        ): Response;
    }
}

export const rendererMiddleware = jsxRenderer(
    ({ children, title, empty, isHomePage }, c) => {
        const session = c.get("session");
        return (
            <Layout
                title={title}
                session={session}
                empty={empty}
                isHomePage={isHomePage}
            >
                {children}
            </Layout>
        );
    },
);
