import { Layout } from "@unbound/web/layout";
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

import type { Env } from "@unbound/types";

type CheckConfigResult = {
    missing: (keyof Env)[];
    errors: Partial<Record<keyof Env, string>>;
    defaults: Partial<Record<keyof Env, string>>;
};

type SetupPageProps = {
    result: CheckConfigResult
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

export function SetupPage({ result: { missing, errors, defaults } }: SetupPageProps) {
    const errorsEntries = Object.entries(errors).map(([key, value]) => `${key}: ${value}`);
    const defaultEntries = Object.entries(defaults).map(([key, value]) =>
        formatEnvKey(key, value),
    );

    return (
        <Layout title="Setup Required" empty={true}>
            <main class="w-full min-h-screen flex justify-center py-24 px-8">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia>
                            <Icon icon={Cog} />
                        </EmptyMedia>
                        <EmptyTitle>Setup Required</EmptyTitle>
                        <EmptyDescription>
                            This server has not completed it's setup yet. If you're the server owner/admin, please follow these steps:
                        </EmptyDescription>
                        <div class="w-16 h-px bg-muted mt-4" />
                    </EmptyHeader>
                    <EmptyContent class="max-w-2xl gap-4">
                        {missing.length > 0 && (
                            <div class="text-muted-foreground text-sm/relaxed">
                                Some required environment variables are missing:<br/>
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
                                <div class="text-muted-foreground text-sm/relaxed">
                                    Some environment variables
                                    {missing.length > 0 ? " also " : " "}
                                    returning error:
                                </div>
                                <Card class="w-full text-left" size="sm">
                                    <CardContent>
                                        <pre class="w-full overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed text-card-foreground">
                                            <code>{errorsEntries.join("\n")}</code>
                                        </pre>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                        <div class="text-muted-foreground text-sm/relaxed">
                            Please configure these variables and restart/rebuild
                            the server.
                        </div>
                        {defaultEntries.length > 0 && (
                            <Card class="w-full text-left mt-4" size="sm">
                                <CardHeader>
                                    <CardTitle>Generated values</CardTitle>
                                    <CardDescription>
                                        These are generated values to help with your setup. You may copy these into your environment.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <pre class="w-full overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed text-card-foreground">
                                        <code>{defaultEntries.join("\n")}</code>
                                    </pre>
                                    {
                                        ("JWK_PUBLIC_KEY" in defaults || "JWK_PRIVATE_KEY" in defaults)
                                        && <CardDescription class="text-wrap"><b>Note:</b> JWK public and private keys must be <b>copied</b> together, as they form a corresponding key pair and must not be separated.</CardDescription>
                                    }
                                </CardContent>
                            </Card>
                        )}
                    </EmptyContent>
                </Empty>
            </main>
        </Layout>
    );
}
