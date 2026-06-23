import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName } from "./shared";

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            url: "/",
            title: (
                <span className="flex flex-row items-center ml-1 mt-px gap-3">
                    <img
                        src="/favicon.ico"
                        alt=""
                        className="rounded-full size-6"
                    />
                    <div className="w-px h-5 bg-muted" />
                    <span className="text-muted-foreground">Docs</span>
                </span>
            ),
        },
        themeSwitch: {
            enabled: false,
        },
    };
}
