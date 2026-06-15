import clsx from "clsx";

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@unbound/web/components/empty";
import { Button } from "@unbound/web/components/button";

import {
    CircleAlert,
    CircleQuestionMark,
    RotateCw,
    House,
} from "@lucide/icons";
import { Icon } from "@unbound/web/components/icon";

import type { PropsWithChildren } from "hono/jsx";

type ErrorPageProps = PropsWithChildren<{
    showRetry?: boolean;
    showHome?: boolean;
}>;

export function ErrorPage({
    children,
    showRetry = false,
    showHome = true,
}: ErrorPageProps) {
    return (
        <div class="flex flex-1 justify-center items-center pb-8">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia class="bg-warning-background mb-6">
                        <Icon icon={CircleAlert} class="text-warning" />
                    </EmptyMedia>
                    <EmptyTitle>Something Wrong</EmptyTitle>
                    <EmptyDescription>{children}</EmptyDescription>
                </EmptyHeader>
                {(showRetry || showHome) && (
                    <EmptyContent class="max-w-xs flex-row justify-center mt-8">
                        {showRetry && (
                            <Button
                                variant="outline"
                                class={clsx(
                                    showRetry && showHome
                                        ? "shrink-0 flex-1"
                                        : "",
                                    "cursor-pointer",
                                )}
                                onClick={"window.location.reload()" as any}
                            >
                                <Icon icon={RotateCw} />
                                Retry
                            </Button>
                        )}
                        {showHome && (
                            <Button
                                asChild={true}
                                variant="outline"
                                class={clsx(
                                    showRetry && showHome
                                        ? "shrink-0 flex-1"
                                        : "",
                                    "cursor-pointer",
                                )}
                            >
                                <a href="/">
                                    <Icon icon={House} />
                                    Back to Home
                                </a>
                            </Button>
                        )}
                    </EmptyContent>
                )}
            </Empty>
        </div>
    );
}

export function ValidationPage({ messages }: { messages: string[] }) {
    return (
        <ErrorPage>
            This request is malformed. Check the request and try again. If
            you're the developer,{" "}
            <a
                class="underline cursor-pointer"
                onclick={`event.preventDefault(),(y=(x=this.parentElement.querySelector("pre")).parentElement).style.maxHeight&&"0px"!=y.style.maxHeight?(y.style.maxHeight="0px",y.style.opacity="1"):(y.style.maxHeight=x.offsetHeight+24+"px",y.style.opacity="1");`}
            >
                click here for details
            </a>
            .
            {messages.length > 0 && (
                <div class="open-transition">
                    <div class="h-6" />
                    <pre class="w-full overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
                        {messages.join("\n")}
                    </pre>
                </div>
            )}
        </ErrorPage>
    );
}

export function NotFoundPage() {
    return (
        <div class="flex flex-1 justify-center items-center pb-8">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia class="bg-warning-background mb-6">
                        <Icon icon={CircleQuestionMark} class="text-warning" />
                    </EmptyMedia>
                    <EmptyTitle>404 Not Found</EmptyTitle>
                    <EmptyDescription>
                        This page does not exist. Check the url and try again.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent class="max-w-xs flex-row justify-center mt-8">
                    <Button
                        asChild={true}
                        variant="outline"
                        class="cursor-pointer"
                    >
                        <a href="/">
                            <Icon icon={House} />
                            Back to Home
                        </a>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}
