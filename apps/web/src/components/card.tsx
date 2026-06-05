import type { JSX } from "hono/jsx";
import { css } from "@unbound/web/lib/utils";

type CardProps = JSX.IntrinsicElements["div"] & {
    size?: "default" | "sm";
};

export function Card({
    class: className,
    size = "default",
    ...props
}: CardProps) {
    return (
        <div
            data-slot="card"
            data-size={size}
            class={css(
                "group/card flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 text-sm text-foreground data-[size=sm]:gap-3 data-[size=sm]:p-3",
                className,
            )}
            {...props}
        />
    );
}

export function CardHeader({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="card-header"
            class={css("flex flex-col gap-1", className)}
            {...props}
        />
    );
}

export function CardTitle({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="card-title"
            class={css(
                "text-base font-medium leading-snug group-data-[size=sm]/card:text-sm",
                className,
            )}
            {...props}
        />
    );
}

export function CardDescription({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="card-description"
            class={css("text-sm/relaxed text-muted-foreground", className)}
            {...props}
        />
    );
}

export function CardAction({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="card-action"
            class={css("self-start justify-self-end", className)}
            {...props}
        />
    );
}

export function CardContent({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="card-content"
            class={css("flex flex-col gap-4", className)}
            {...props}
        />
    );
}

export function CardFooter({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="card-footer"
            class={css(
                "flex items-center border-t border-border bg-muted/50 pt-4 text-muted-foreground",
                className,
            )}
            {...props}
        />
    );
}
