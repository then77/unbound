import { zValidator } from "@hono/zod-validator";

import { ValidationPage } from "@unbound/web/pages/error";

import type { Hook } from "@hono/zod-validator";
import type { Env, ValidationTargets } from "hono";
import type { AppEnv } from "@unbound/server/server";

import type * as v3 from "zod/v3";
import type * as v4 from "zod/v4/core";

type ZodSchema = v3.ZodType | v4.$ZodType;
type ZodInfer<S extends ZodSchema> = S extends v3.ZodType
    ? v3.infer<S>
    : S extends v4.$ZodType
      ? v4.infer<S>
      : never;
type PageValidatorHook<
    T extends keyof ValidationTargets,
    S extends ZodSchema,
    E extends Env = AppEnv,
    P extends string = string,
> = Hook<ZodInfer<S>, E, P, T, {}, S>;

type PageValidatorResult<
    T extends keyof ValidationTargets,
    S extends ZodSchema,
    E extends Env = AppEnv,
    P extends string = string,
> = Parameters<PageValidatorHook<T, S, E, P>>[0];

type PageValidatorContext<
    T extends keyof ValidationTargets,
    S extends ZodSchema,
    E extends Env = AppEnv,
    P extends string = string,
> = Parameters<PageValidatorHook<T, S, E, P>>[1];

function isDefaultZodMessage(message: string): boolean {
    return /^Invalid .*:/.test(message);
}

function formatValidationMessages(
    target: keyof ValidationTargets,
    issues: v4.$ZodIssue[] | v3.ZodIssue[],
): string[] {
    return issues.map((issue) => {
        const field = issue.path?.length
            ? issue.path.map(String).join(".")
            : String(target);

        // Format zod messages into human readable
        switch (issue.code) {
            case "invalid_type":
                if (!isDefaultZodMessage(issue.message)) {
                    return `Invalid type: ${issue.message}`;
                }

                if (issue.message.includes("received undefined")) {
                    return `Missing required parameter: ${field}`;
                }

                return `Invalid type for parameter: ${field}`;

            case "invalid_value":
                if (!isDefaultZodMessage(issue.message)) {
                    return `Invalid value: ${issue.message}`;
                }

                if ("values" in issue) {
                    return `Invalid value for parameter: ${field}. Expected ${issue.values
                        .map((v) => JSON.stringify(v))
                        .join(" or ")}`;
                }

                return `Invalid value for parameter: ${field}`;

            case "invalid_format":
                if (!isDefaultZodMessage(issue.message)) {
                    return `Invalid format: ${issue.message}`;
                }

                return `Invalid format for parameter: ${field}`;

            case "too_small":
            case "too_big":
                if (!isDefaultZodMessage(issue.message)) {
                    return `Invalid value: ${issue.message}`;
                }

                return `Invalid value for parameter: ${field}`;

            case "unrecognized_keys":
                return issue.keys
                    .map((key) => `Unsupported parameter: ${key}`)
                    .join("\n");

            default:
                if (!isDefaultZodMessage(issue.message)) {
                    return `Invalid parameter: ${issue.message}`;
                }

                return `Invalid parameter: ${field}`;
        }
    });
}

export function pageValidator<
    T extends keyof ValidationTargets,
    S extends ZodSchema,
    E extends Env = AppEnv,
    P extends string = string,
>(
    target: T,
    schema: S,
    error?: (
        result: PageValidatorResult<T, S, E, P>,
        c: PageValidatorContext<T, S, E, P>,
    ) => Response | void | Promise<Response | void>,
) {
    const hook: PageValidatorHook<T, S, E, P> = (result, c) => {
        if (!result.success) {
            const errorsEntries = formatValidationMessages(
                target,
                result.error.issues,
            );

            return (
                error?.(result, c) ??
                c.render(<ValidationPage messages={errorsEntries} />, {
                    title: "Oops!",
                })
            );
        }
    };

    return zValidator<S, T, E, P, PageValidatorHook<T, S, E, P>>(
        target,
        schema,
        hook,
    );
}
