import type { ReactNode } from "react";
import { Provider } from "@/components/provider";
import "@/styles/globals.css";

export default async function RootElement({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en" className="antialiased" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body
                data-version="1.0"
                className="flex flex-col min-h-screen bg-fd-background text-fd-foreground font-sans"
            >
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}

export async function getConfig() {
    return {
        render: "static",
    } as const;
}
