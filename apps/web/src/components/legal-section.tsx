import type { PropsWithChildren } from "hono/jsx";

export function LegalSection({
    title,
    children,
}: PropsWithChildren<{ title: string }>) {
    return (
        <div class="flex flex-col gap-4">
            <h1 class="text-2xl font-bold tracking-tight text-balance">
                {title}
            </h1>
            <div class="flex flex-col gap-4 text-muted-foreground leading-relaxed [&_a]:text-foreground [&_a]:underline [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
                {children}
            </div>
        </div>
    );
}
