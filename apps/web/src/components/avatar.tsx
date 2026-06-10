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
                "group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
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
            class={css("aspect-square size-full", className)}
            onError={`this.style.display="none";this.parentElement.querySelector("[data-slot=avatar-fallback]").style.display="flex"`}
            {...props}
        />
    );
}

export type AvatarFallbackProps = JSX.IntrinsicElements["span"] & {
    text?: string;
};

function getAvatarFallbackText(value: unknown) {
    if (typeof value !== "string" && typeof value !== "number") {
        return value;
    }

    const text = String(value).trim();

    if (!text) {
        return "";
    }

    const words = text.split(/\s+/).filter(Boolean);

    return words
        .slice(0, 2)
        .map((word) => Array.from(word)[0]?.toUpperCase() ?? "")
        .join("");
}

export function AvatarFallback({
    class: className,
    text,
    children,
    ...props
}: AvatarFallbackProps) {
    return (
        <span
            data-slot="avatar-fallback"
            class={css(
                "hidden size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
                className,
            )}
            {...props}
        >
            {getAvatarFallbackText(text ?? children)}
        </span>
    );
}
