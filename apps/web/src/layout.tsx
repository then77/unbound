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
    gitCommit?: string | null;
    nextVersion?: boolean | null;
}>;

export function Layout({
    appName,
    title,
    session,
    empty,
    navbarState,
    gitCommit,
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
                        <style>{`@keyframes next-notice{from{transform:translateX(0)}to{transform:translateX(-50%)}}.next-notice{animation:36s linear infinite next-notice}`}</style>
                        <div class="fixed top-0 left-0 z-9999 w-full overflow-hidden bg-warning-background/50 p-2 text-sm text-warning-foreground pointer-events-none whitespace-nowrap">
                            <div class="next-notice flex w-max">
                                {Array.from({ length: 6 }, (_, index) => (
                                    <span
                                        aria-hidden={
                                            index === 0 ? undefined : "true"
                                        }
                                    >
                                        Heads up! This is the{" "}
                                        <b>Unbound Next</b> (WIP) version and
                                        may contain unfinished/buggy features.
                                        Do not use this for production!
                                        <span class="mx-4" aria-hidden="true">
                                            ㆍ
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div class="h-7 sm:h-6" />
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
                        <footer class="w-full flex flex-col md:flex-row gap-4 py-6 border-t border-muted text-sm text-muted-foreground [&_a]:hover:text-foreground">
                            <p class="md:flex-1">
                                &copy; {new Date().getFullYear()} Project
                                Unbound.
                                {gitCommit && (
                                    <>
                                        {" "}
                                        Build version{" "}
                                        <a
                                            class="underline"
                                            href={`https://github.com/then77/unbound/commit/${gitCommit}`}
                                        >
                                            {gitCommit.slice(0, 7)}
                                        </a>
                                    </>
                                )}
                            </p>
                            <div class="flex flex-row gap-4">
                                <a href="/terms">Terms</a>
                                <a href="/privacy">Privacy</a>
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
