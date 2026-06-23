import { getPageImage, getPageMarkdownUrl, source } from "@/lib/source";
import { PageProps } from "waku/router";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
    DocsBody,
    DocsDescription,
    DocsPage,
    DocsTitle,
    MarkdownCopyButton,
    ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { unstable_notFound } from "waku/router/server";
import { getMDXComponents } from "@/components/mdx";

export default function Page({ slugs }: PageProps<"/docs/[...slugs]">) {
    const page = source.getPage(slugs);
    if (!page) unstable_notFound();

    const MDX = page.data.body;
    const markdownUrl = getPageMarkdownUrl(page).url;
    return (
        <DocsPage toc={page.data.toc}>
            <meta property="og:image" content={getPageImage(slugs).url} />
            <DocsTitle className="text-3xl font-bold">
                {page.data.title}
            </DocsTitle>
            <DocsDescription className="mb-0">
                {page.data.description}
            </DocsDescription>
            {page.data.showAction != false ? (
                <div className="flex flex-row gap-2 items-center border-b pt-2 pb-6">
                    <MarkdownCopyButton markdownUrl={markdownUrl} />
                    <ViewOptionsPopover markdownUrl={markdownUrl} />
                </div>
            ) : (
                <div className="h-4" />
            )}
            <DocsBody>
                <MDX
                    components={getMDXComponents({
                        // this allows you to link to other pages with relative file paths
                        a: createRelativeLink(source, page),
                    })}
                />
            </DocsBody>
        </DocsPage>
    );
}

export async function getConfig() {
    const pages = source
        .generateParams()
        .map((item) => (item.lang ? [item.lang, ...item.slug] : item.slug));

    return {
        render: "static" as const,
        staticPaths: pages,
    } as const;
}
