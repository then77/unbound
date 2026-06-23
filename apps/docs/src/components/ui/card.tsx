import Link from "fumadocs-core/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type BaseCardProps = {
    icon?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    className?: string;
    children?: ReactNode;
};

type CardLinkProps = BaseCardProps &
    Omit<
        ComponentProps<typeof Link>,
        "title" | "href" | "className" | "children"
    > & {
        href: string;
    };

type CardDivProps = BaseCardProps &
    Omit<ComponentProps<"div">, "title" | "className" | "children"> & {
        href?: undefined;
    };

export type CardProps = CardLinkProps | CardDivProps;

export function Cards({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("grid grid-cols-2 gap-3 @container", className)}
            {...props}
        />
    );
}

export function Card({
    icon,
    title,
    description,
    href,
    className,
    children,
    ...props
}: CardProps) {
    const content = (
        <>
            {icon ? (
                <div className="not-prose mb-2 w-fit rounded-lg border border-border bg-muted/50 p-1.5 text-muted-foreground [&_svg]:size-4">
                    {icon}
                </div>
            ) : null}
            <h3 className="not-prose mb-1 text-sm font-medium">{title}</h3>
            {description ? (
                <p className="my-0! text-sm text-muted-foreground">
                    {description}
                </p>
            ) : null}
            <div className="text-sm text-muted-foreground prose-no-margin empty:hidden">
                {children}
            </div>
        </>
    );

    const classes = cn(
        "block rounded-xl border bg-card p-4 text-foreground transition-colors @max-lg:col-span-full",
        href && "hover:bg-muted/30",
        className,
    );

    if (href) {
        return (
            <Link
                {...(props as Omit<
                    ComponentProps<typeof Link>,
                    "title" | "href" | "className" | "children"
                >)}
                href={href}
                data-card
                className={classes}
            >
                {content}
            </Link>
        );
    }

    return (
        <div
            {...(props as Omit<
                ComponentProps<"div">,
                "title" | "className" | "children"
            >)}
            data-card
            className={classes}
        >
            {content}
        </div>
    );
}
