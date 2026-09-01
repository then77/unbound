import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "./shared";
import { jsx } from "react/jsx-runtime";

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            // JSX supported
            title: appName,
        },
        links: [
            {
                type: "icon",
                label: "Visit Unbound Auth npm site.",
                text: "Unbound Auth npm",
                url: "https://npmjs.org/package/unbound-auth",
                icon: jsx("svg", {
                    role: "img",
                    viewBox: "0 0 24 24",
                    fill: "currentColor",
                    children: jsx("path", {
                        d: "M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z",
                    }),
                }),
                external: true,
            },
        ],
        githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    };
}
