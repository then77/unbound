/**
 * Button component
 *
 * Adapted from shadcn/ui button component
 * @see https://ui.shadcn.com/docs/components/button
 */

import { cva, type VariantProps } from "class-variance-authority";
import type { JSX } from "hono/jsx";
import { css } from "@unbound/web/lib/utils";

export const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm text-foreground font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                primary: "bg-primary hover:bg-primary/80",

                outline: "border-foreground bg-muted/10 hover:bg-muted/30",

                danger: "bg-danger/10 text-danger hover:bg-danger/20 focus-visible:border-danger/40 focus-visible:ring-danger/20 dark:bg-danger/20 dark:hover:bg-danger/30 dark:focus-visible:ring-danger/40",
            },

            size: {
                default:
                    "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",

                xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",

                sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",

                lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",

                icon: "size-8",

                "icon-xs":
                    "size-6 rounded-[min(var(--radius-md),10px)] [&_svg:not([class*='size-'])]:size-3",

                "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)]",

                "icon-lg": "size-9",
            },
        },

        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    },
);

type ButtonProps = JSX.IntrinsicElements["button"] &
    VariantProps<typeof buttonVariants>;

export function Button({
    class: className,
    variant,
    size,
    ...props
}: ButtonProps) {
    return (
        <button
            data-slot="button"
            class={css(
                buttonVariants({
                    variant,
                    size,
                }),
                className,
            )}
            {...props}
        />
    );
}
