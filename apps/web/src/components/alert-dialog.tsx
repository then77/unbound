/**
 * Alert dialog component
 *
 * Adapted from shadcn/ui alert dialog component
 * @see https://ui.shadcn.com/docs/components/alert-dialog
 */

import { type VariantProps } from "class-variance-authority";
import type { JSX } from "hono/jsx";
import { Button, buttonVariants } from "@unbound/web/components/button";
import { Card, type CardProps } from "@unbound/web/components/card";
import { css } from "@unbound/web/lib/utils";

type AlertDialogProps = JSX.IntrinsicElements["div"] & {
    open?: boolean;
};

type AlertDialogButtonProps = JSX.IntrinsicElements["button"] &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    };

export function AlertDialog({
    class: className,
    open = false,
    ...props
}: AlertDialogProps) {
    const state = open ? "open" : "closed";

    return (
        <div
            data-slot="alert-dialog"
            data-state={state}
            class={css("fixed inset-0 z-50", className)}
            {...props}
        />
    );
}

export function AlertDialogOverlay({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="alert-dialog-overlay"
            data-alert-dialog-close
            class={css(
                "fixed inset-0 bg-black/50 backdrop-blur-[2px]",
                className,
            )}
            {...props}
        />
    );
}

export function AlertDialogContent({
    class: className,
    size = "default",
    ...props
}: CardProps) {
    return (
        <Card
            data-slot="alert-dialog-content"
            role="alertdialog"
            aria-modal="true"
            size={size}
            class={css(
                "fixed left-1/2 top-1/2 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 p-6 pt-8 sm:pt-6 gap-8 sm:gap-6 shadow-lg outline-none",
                className,
            )}
            {...props}
        />
    );
}

export function AlertDialogHeader({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="alert-dialog-header"
            class={css(
                "flex flex-col gap-1.5 text-center sm:text-left",
                className,
            )}
            {...props}
        />
    );
}

export function AlertDialogFooter({
    class: className,
    ...props
}: JSX.IntrinsicElements["div"]) {
    return (
        <div
            data-slot="alert-dialog-footer"
            class={css(
                "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
                className,
            )}
            {...props}
        />
    );
}

export function AlertDialogTitle({
    class: className,
    ...props
}: JSX.IntrinsicElements["h2"]) {
    return (
        <h2
            data-slot="alert-dialog-title"
            class={css("text-lg font-semibold leading-none", className)}
            {...props}
        />
    );
}

export function AlertDialogDescription({
    class: className,
    ...props
}: JSX.IntrinsicElements["p"]) {
    return (
        <p
            data-slot="alert-dialog-description"
            class={css("text-sm/relaxed text-muted-foreground", className)}
            {...props}
        />
    );
}

export function AlertDialogAction({
    class: className,
    variant,
    size,
    ...props
}: AlertDialogButtonProps) {
    return (
        <Button
            data-slot="alert-dialog-action"
            variant={variant}
            size={size}
            class={css("cursor-pointer", className)}
            {...props}
        />
    );
}

export function AlertDialogCancel({
    class: className,
    variant = "outline",
    size,
    ...props
}: AlertDialogButtonProps) {
    return (
        <Button
            data-slot="alert-dialog-cancel"
            data-alert-dialog-close
            type="button"
            variant={variant}
            size={size}
            class={css("cursor-pointer", className)}
            {...props}
        />
    );
}
