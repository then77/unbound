/**
 * Avatar component
 *
 * Adapted from shadcn/ui avatar component
 * @see https://ui.shadcn.com/docs/components/avatar
 */

import type { JSX } from "hono/jsx";
import { css } from "@unbound/web/lib/utils";

export type AvatarProps = JSX.IntrinsicElements["div"] & {
    size?: "default" | "sm" | "lg";
};

export function Avatar({
    class: className,
    size = "default",
    ...props
}: AvatarProps) {
    return (
        <div
            data-slot="avatar"
            data-size={size}
            class={css(
                "group/avatar relative flex size-8 shrink-0 rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
                className,
            )}
            {...props}
        />
    );
}

export function AvatarImage({
    class: className,
    ...props
}: JSX.IntrinsicElements["img"]) {
    return (
        <img
            data-slot="avatar-image"
            class={css("aspect-square size-full rounded-full", className)}
            onError={`this.style.display="none";this.parentElement.querySelector("[data-slot=avatar-fallback]").style.display="flex"`}
            {...props}
        />
    );
}

export type AvatarBadgeProps = JSX.IntrinsicElements["span"];

export function AvatarBadge({ class: className, ...props }: AvatarBadgeProps) {
    return (
        <span
            data-slot="avatar-badge"
            class={css(
                "absolute -right-1 -bottom-1 z-10 inline-flex items-center justify-center rounded-full bg-muted text-card-foreground border-4 border-card select-none",
                "p-1 [&>svg]:size-3 group-data-[size=lg]/avatar:size-5 group-data-[size=lg]/avatar:[&>svg]:size-3.5 group-data-[size=sm]/avatar:size-3.5 group-data-[size=sm]/avatar:[&>svg]:size-2.5",
                className,
            )}
            {...props}
        />
    );
}

export type AvatarFallbackProps = JSX.IntrinsicElements["span"] & {
    text?: string;
    charCount?: number;
    alwaysShow?: boolean;
};

function getAvatarFallbackText(value: unknown, count: number = 2) {
    if (typeof value !== "string" && typeof value !== "number") {
        return value;
    }

    const text = String(value).trim();

    if (!text) {
        return "";
    }

    const words = text.split(/\s+/).filter(Boolean);

    return words
        .slice(0, count)
        .map((word) => Array.from(word)[0]?.toUpperCase() ?? "")
        .join("");
}

export function AvatarFallback({
    class: className,
    text,
    charCount,
    alwaysShow,
    children,
    ...props
}: AvatarFallbackProps) {
    return (
        <span
            data-slot="avatar-fallback"
            class={css(
                alwaysShow ? "flex" : "hidden",
                "size-full justify-center items-center rounded-full bg-muted text-xs text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children ?? getAvatarFallbackText(text, charCount)}
        </span>
    );
}
