/**
 * Empty component
 *
 * Adapted from shadcn/ui empty component
 * @see https://ui.shadcn.com/docs/components/empty
 */

import type { JSX } from "hono/jsx";
import { css } from "@unbound/web/lib/utils";

export function Empty({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="empty"
            class={css(
                "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance",
                className,
            )}
            {...props}
        />
    );
}

export function EmptyHeader({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="empty-header"
            class={css("flex max-w-sm flex-col items-center gap-2", className)}
            {...props}
        />
    );
}

export function EmptyMedia({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="empty-media"
            class={css(
                "mb-2 flex p-2 shrink-0 items-center justify-center rounded-lg bg-white/10 [&_svg]:pointer-events-none [&_svg]:size-8 [&_svg]:shrink-0",
                className,
            )}
            {...props}
        />
    );
}

export function EmptyTitle({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="empty-title"
            class={css("text-xl font-semibold tracking-tight", className)}
            {...props}
        />
    );
}

export function EmptyDescription({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="empty-description"
            class={css(
                "text-muted-foreground text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
                className,
            )}
            {...props}
        />
    );
}

export function EmptyContent({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="empty-content"
            class={css(
                "flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance",
                className,
            )}
            {...props}
        />
    );
}
