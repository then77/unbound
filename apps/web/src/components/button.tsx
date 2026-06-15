/**
 * Button component
 *
 * Adapted from shadcn/ui button component
 * @see https://ui.shadcn.com/docs/components/button
 */

import { cva, type VariantProps } from "class-variance-authority";
import { cloneElement, type JSX } from "hono/jsx";
import { css } from "@unbound/web/lib/utils";

export const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm text-foreground font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:mt-px",
    {
        variants: {
            variant: {
                primary: "bg-primary hover:bg-primary/80",

                outline: "border-border bg-muted/30 hover:bg-muted/50",

                danger: "bg-danger hover:bg-danger/80",
            },

            size: {
                default:
                    "h-11 gap-2.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",

                xs: "h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",

                sm: "h-10 gap-1.5 rounded-[min(var(--radius-md),12px)] px-3.5 text-[0.8rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",

                lg: "h-12 gap-3 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",

                icon: "size-11",

                "icon-xs":
                    "size-9 rounded-[min(var(--radius-md),10px)] [&_svg:not([class*='size-'])]:size-3",

                "icon-sm": "size-10 rounded-[min(var(--radius-md),12px)]",

                "icon-lg": "size-12",
            },
        },

        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    },
);

type ButtonProps = JSX.IntrinsicElements["button"] &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    };

export function Button({
    class: className,
    variant,
    size,
    asChild,
    children,
    ...props
}: ButtonProps) {
    const classes = css(buttonVariants({ variant, size }), className);

    if (asChild) {
        const child = Array.isArray(children) ? children[0] : children;
        return cloneElement(child, {
            "data-slot": "button",
            ...props,
            class: css(classes, (child as any).props?.class),
        });
    }

    return (
        <button data-slot="button" class={classes} {...props}>
            {children}
        </button>
    );
}
