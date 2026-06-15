import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@unbound/web/components/empty";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@unbound/web/components/card";

import { Cog } from "@lucide/icons";
import { Icon } from "@unbound/web/components/icon";

import type { Env as UnboundEnv } from "@unbound/types";

type CheckConfigResult = {
    missing: (keyof UnboundEnv)[];
    errors: Partial<Record<keyof UnboundEnv, string>>;
    defaults: Partial<Record<keyof UnboundEnv, string>>;
};

type SetupPageProps = {
    result: CheckConfigResult;
};

function formatEnvValue(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}

function formatEnvKey(key: string, value: string): string {
    return `${key}=\"${formatEnvValue(value)}\"`;
}

export function SetupPage({
    result: { missing, errors, defaults },
}: SetupPageProps) {
    const errorsEntries = Object.entries(errors).map(
        ([key, value]) => `${key}: ${value}`,
    );
    const defaultEntries = Object.entries(defaults).map(([key, value]) =>
        formatEnvKey(key, value),
    );

    return (
        <main class="w-full min-h-svh flex justify-center py-24">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <Icon icon={Cog} />
                    </EmptyMedia>
                    <EmptyTitle>Setup Required</EmptyTitle>
                    <EmptyDescription>
                        This server has not completed it's setup yet. If you're
                        the server owner/admin, please follow these steps:
                    </EmptyDescription>
                    <div class="w-16 h-px bg-muted mt-4" />
                </EmptyHeader>
                <EmptyContent class="max-w-2xl gap-4">
                    {missing.length > 0 && (
                        <div class="text-muted-foreground text-base/relaxed">
                            Some required environment variables are missing:
                            <br />
                            {missing.map((m, i) => (
                                <>
                                    {i > 0 && ", "}
                                    <code>{m}</code>
                                </>
                            ))}
                        </div>
                    )}
                    {errorsEntries.length > 0 && (
                        <>
                            <div class="text-muted-foreground text-base/relaxed">
                                Some environment variables
                                {missing.length > 0 ? " also " : " are "}
                                returning error:
                            </div>
                            <Card class="w-full text-left" size="sm">
                                <CardContent>
                                    <pre class="w-full overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
                                        <code>{errorsEntries.join("\n")}</code>
                                    </pre>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    <div class="text-muted-foreground text-base/relaxed">
                        Please configure these variables and restart/rebuild the
                        server.
                    </div>
                    {defaultEntries.length > 0 && (
                        <Card class="w-full text-left mt-4">
                            <CardHeader>
                                <CardTitle>Generated values</CardTitle>
                                <CardDescription>
                                    These are generated values to help with your
                                    setup. You may copy these into your
                                    environment.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre class="w-full overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
                                    <code>{defaultEntries.join("\n")}</code>
                                </pre>
                                {("JWK_PUBLIC_KEY" in defaults ||
                                    "JWK_PRIVATE_KEY" in defaults) && (
                                    <CardDescription class="text-wrap">
                                        <b>Note:</b> JWK public and private keys
                                        must be <b>copied</b> together, as they
                                        form a corresponding key pair and must
                                        not be separated.
                                    </CardDescription>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </EmptyContent>
            </Empty>
        </main>
    );
}
