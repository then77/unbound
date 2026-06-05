import {
    generateRandomString,
    generateJWKPair,
} from "@unbound/server/utils/generate";

import type { Context } from "hono";
import type { AppEnv } from "@unbound/server/server";
import type { Env } from "@unbound/types";

type CheckConfigResult = {
    missing: (keyof Env)[];
    defaults: Partial<Record<keyof Env, string>>;
};
export async function checkEnvConfiguration(
    c: Context<AppEnv>,
): Promise<CheckConfigResult> {
    const result: CheckConfigResult = { missing: [], defaults: {} };
    function add(missing: keyof Env, defaultValue?: string) {
        result.missing.push(missing);
        if (defaultValue) result.defaults[missing] = defaultValue;
    }

    if (!c.env.SESSION_SECRET_KEY)
        add("SESSION_SECRET_KEY", generateRandomString());

    if (!c.env.JWK_PRIVATE_KEY || !c.env.JWK_PUBLIC_KEY) {
        const jwks = await generateJWKPair();
        add("JWK_PRIVATE_KEY", JSON.stringify(jwks.private));
        add("JWK_PUBLIC_KEY", JSON.stringify(jwks.public));
    }

    return result;
}
