import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusjakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            className={plusjakarta.className}
            suppressHydrationWarning
        >
            <body className="flex flex-col min-h-screen">
                <RootProvider
                    theme={{
                        defaultTheme: "dark",
                        enableSystem: false,
                    }}
                >
                    {children}
                </RootProvider>
            </body>
        </html>
    );
}
