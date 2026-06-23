import { cva, type VariantProps } from "class-variance-authority";
import {
    cloneElement,
    isValidElement,
    type ComponentProps,
    type ReactElement,
} from "react";
import { cn } from "@/lib/cn";

const variants = {
    primary: "bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/80",
    outline:
        "border-fd-border bg-fd-muted/30 text-fd-foreground hover:bg-fd-muted/50",
    danger: "bg-danger text-danger-foreground hover:bg-danger/80",
    ghost: "hover:bg-fd-accent hover:text-fd-accent-foreground",
    secondary:
        "border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
} as const;

export const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-fd-ring focus-visible:ring-3 focus-visible:ring-fd-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:mt-px",
    {
        variants: {
            variant: variants,
            // fumadocs use `color` instead of `variant`
            color: variants,
            size: {
                default: "h-11 gap-2.5 px-5",
                xs: "h-9 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
                sm: "h-10 gap-1.5 rounded-[min(var(--radius-md),12px)] px-3.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
                lg: "h-12 gap-3 px-6",
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

export type ButtonProps = Omit<ComponentProps<"button">, "color"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        class?: string;
    };

export function Button({
    class: classAlias,
    className,
    variant,
    color,
    size,
    asChild,
    children,
    ...props
}: ButtonProps) {
    const classes = cn(
        buttonVariants({ variant, color, size }),
        classAlias,
        className,
    );

    if (asChild) {
        const child = Array.isArray(children) ? children[0] : children;

        if (!isValidElement(child)) return null;

        const element = child as ReactElement<{
            className?: string;
            class?: string;
        }>;

        return cloneElement(element, {
            ...props,
            "data-slot": "button",
            className: cn(
                classes,
                element.props.className,
                element.props.class,
            ),
        } as Partial<typeof element.props>);
    }

    return (
        <button data-slot="button" className={classes} {...props}>
            {children}
        </button>
    );
}
