import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { Header } from "@/layouts/notebook/slots/header";
import {
    SidebarProvider,
    Sidebar,
    SidebarTrigger,
    SidebarCollapseTrigger,
    useSidebar,
} from "@/layouts/notebook/slots/sidebar";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/docs">) {
    const { nav, ...base } = baseOptions();

    return (
        <DocsLayout
            {...base}
            nav={{ ...nav, mode: "top" }}
            tree={source.getPageTree()}
            sidebar={{ collapsible: false }}
            slots={{
                header: Header,
                sidebar: {
                    provider: SidebarProvider,
                    root: Sidebar,
                    trigger: SidebarTrigger,
                    collapseTrigger: SidebarCollapseTrigger,
                    useSidebar: useSidebar,
                },
            }}
        >
            {children}
        </DocsLayout>
    );
}
