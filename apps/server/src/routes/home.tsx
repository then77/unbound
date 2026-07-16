import { Hono } from "hono";

import { HomePage } from "@unbound/web/pages/home";

import type { AppEnv } from "@unbound/server";

const app = new Hono<AppEnv>();

app.get("/", async (c) =>
    c.render(<HomePage />, { title: "Home", navbarState: "show" }),
);

export default app;
