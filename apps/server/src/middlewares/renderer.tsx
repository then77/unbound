import { jsxRenderer } from "hono/jsx-renderer";

import { Layout } from "@unbound/web/layout";

export const rendererMiddleware = jsxRenderer(
    ({ children, title, empty }, c) => {
        const session = c.get("session");
        return (
            <Layout title={title} session={session} empty={empty}>
                {children}
            </Layout>
        );
    },
);
