import type { PropsWithChildren } from "hono/jsx";

export type LayoutProps = PropsWithChildren<{
    title?: string | null;
}>;

export default function Layout({ title, children }: LayoutProps) {
    return (
        <html>
            <head>
                <title>{title ? `${title} - Unbound` : "Unbound"}</title>
                <link rel="stylesheet" href="/style.css" />
            </head>
            <body class="bg-white">
                Test from layout.
                {children}
            </body>
        </html>
    )
}
