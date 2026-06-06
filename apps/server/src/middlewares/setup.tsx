import { createMiddleware } from "hono/factory";

import { checkEnvConfiguration } from "@unbound/server/utils/config";

import { SetupPage } from "@unbound/web/pages/setup";

import type { AppEnv } from "@unbound/server/server";

export const setupMiddleware = createMiddleware<AppEnv>(async (c, next) => {
    if (c.req.path == "/style.css") {
        await next();
        return;
    }
    
    const result = await checkEnvConfiguration(c);
    if (
        (result.missing && result.missing.length > 0) ||
        (result.errors && Object.entries(result.errors).length > 0)
    ) {
        return c.html(<SetupPage result={result} />);
    }
    
    await next();
});
