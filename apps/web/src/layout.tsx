import type { PropsWithChildren } from "hono/jsx";

import type { Session } from "@unbound/types";

export type LayoutProps = PropsWithChildren<{
    title?: string | null;
    session?: Partial<Session> | null;
}>;

export function Layout({ title, children }: LayoutProps) {
    return (
        <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{title ? `${title} - Unbound` : "Unbound"}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="/style.css" />
            </head>
            <body>
                {children}
            </body>
        </html>
    )
}
