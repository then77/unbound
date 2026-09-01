import { getPageImage, getPageMarkdownUrl, source } from "@/lib/source";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import {
    DocsBody,
    DocsDescription,
    DocsPage,
    DocsTitle,
} from "fumadocs-ui/layouts/notebook/page";
import {
    MarkdownCopyButton,
    ViewOptionsPopover,
} from "@/components/ai/page-actions";
import {
    Callout,
    CalloutContainer,
    CalloutTitle,
    CalloutDescription,
} from "@/components/callout";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { gitConfig } from "@/lib/shared";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
    const params = await props.params;
    const page = source.getPage(params.slug);
    if (!page) notFound();

    const MDX = page.data.body;
    const markdownUrl = getPageMarkdownUrl(page).url;

    return (
        <DocsPage
            toc={page.data.toc}
            full={page.data.full}
            className="gap-4 p-6 md:p-8 xl:p-16 xl:pt-12"
        >
            <div className="flex flex-col lg:flex-row items-start gap-4 border-b pb-8">
                <div className="flex flex-col flex-1 gap-4">
                    <DocsTitle className="text-3xl">
                        {page.data.title}
                    </DocsTitle>
                    <DocsDescription className="mb-0">
                        {page.data.description}
                    </DocsDescription>
                </div>
                <div className="flex flex-row gap-2 items-center mt-1">
                    <MarkdownCopyButton markdownUrl={markdownUrl} />
                    <ViewOptionsPopover
                        markdownUrl={markdownUrl}
                        githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/docs/content/docs/${page.path}`}
                    />
                </div>
            </div>
            <DocsBody className="pt-4">
                <MDX
                    components={getMDXComponents({
                        // this allows you to link to other pages with relative file paths
                        a: createRelativeLink(source, page),
                        img: (props) => <ImageZoom {...(props as any)} />,
                        Callout,
                        CalloutContainer,
                        CalloutTitle,
                        CalloutDescription,
                    })}
                />
            </DocsBody>
        </DocsPage>
    );
}

export async function generateStaticParams() {
    return source.generateParams();
}

export async function generateMetadata(
    props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
    const params = await props.params;
    const page = source.getPage(params.slug);
    if (!page) notFound();

    return {
        title: page.data.title,
        description: page.data.description,
        openGraph: {
            images: getPageImage(page).url,
        },
    };
}
