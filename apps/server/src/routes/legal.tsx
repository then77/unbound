import { Hono } from "hono";

import { PrivacyPage } from "@unbound/web/pages/privacy";
import { TermsPage } from "@unbound/web/pages/terms";

import type { AppEnv } from "@unbound/server";

const app = new Hono<AppEnv>();

app.get("/terms", async (c) =>
    c.render(<TermsPage />, { title: "Terms of Service" }),
);

app.get("/privacy", async (c) =>
    c.render(<PrivacyPage />, { title: "Privacy Policy" }),
);

export default app;
