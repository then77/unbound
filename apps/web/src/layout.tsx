import type { PropsWithChildren } from "hono/jsx";

import { Navbar } from "@unbound/web/components/navbar";
import { Flash } from "@unbound/web/components/flash";

import type { Session } from "@unbound/types";

export type LayoutProps = PropsWithChildren<{
    appName: string;
    title?: string | null;
    session?: Partial<Session> | null;
    empty?: boolean;
    navbarState?: null | "show" | "hide";
    nextVersion?: boolean;
}>;

export function Layout({
    appName,
    title,
    session,
    empty,
    navbarState,
    nextVersion,
    children,
}: LayoutProps) {
    return (
        <html class="antialiased">
            <head>
                <meta charset="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>{title ? `${title} - ${appName}` : appName}</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossorigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
                    rel="stylesheet"
                />
                <link rel="stylesheet" href="/style.css" />
            </head>
            <body class="flex flex-col items-center min-h-svh px-8">
                {nextVersion && (
                    <>
                        <div class="fixed top-0 left-0 z-9999 w-full bg-warning-background/50 p-2 px-8 text-center text-sm text-warning-foreground">
                            Heads up! This is <b>Unbound Next</b> (wip) version, and might contains unfinished/buggy feature. Do not use for production!
                        </div>
                        <div class="h-6" />
                    </>
                )}
                {session?.flash && <Flash flash={session.flash} />}
                {empty ? (
                    children
                ) : (
                    <div class="w-full flex-1 max-w-6xl flex flex-col">
                        <Navbar
                            appName={appName}
                            session={session}
                            navbarState={navbarState}
                        />
                        <main class="flex flex-col w-full flex-1">
                            {children}
                        </main>
                        <footer class="w-full flex flex-row py-6 border-t border-muted text-sm text-muted-foreground">
                            <p class="flex-1">
                                &copy; {new Date().getFullYear()} Project
                                Unbound.
                            </p>
                            <div class="flex flex-row gap-4 [&_a]:hover:text-foreground">
                                {/*<a href="/terms">Terms</a>
                                <a href="/privacy">Privacy</a>*/}
                                <a href="https://github.com/then77/unbound">
                                    Github
                                </a>
                            </div>
                        </footer>
                    </div>
                )}
            </body>
        </html>
    );
}
