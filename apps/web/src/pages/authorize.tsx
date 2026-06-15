import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@unbound/web/components/empty";
import { Card, CardContent } from "@unbound/web/components/card";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@unbound/web/components/avatar";
import { Button } from "@unbound/web/components/button";

import { Globe, Check } from "@lucide/icons";
import { Icon } from "@unbound/web/components/icon";

import type { Session } from "@unbound/types";

type AuthorizePageProps = {
    session: Partial<Session> | null;
    clientId: string;
    scopes: string[];
    cancelUrl: string;
    clientIcon?: string | null;
};

function DotLine() {
    return (
        <svg
            width="32"
            viewBox="0 0 32 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="dot-line"
        >
            <circle cx="3.56" cy="4" r="3.5" fill="#999" />
            <circle cx="15.75" cy="4" r="3.5" fill="#999" />
            <circle cx="27.94" cy="4" r="3.5" fill="#999" />
        </svg>
    );
}

export function AuthorizePage({
    session,
    clientId,
    scopes,
    cancelUrl,
    clientIcon,
}: AuthorizePageProps) {
    const scopeEntries = scopes.flatMap((scope, i) =>
        i === 0 ? [<code>{scope}</code>] : [", ", <code>{scope}</code>],
    );
    return (
        <Empty class="pb-16">
            <EmptyHeader>
                <div class="flex flex-row justify-center items-center gap-3 mb-6">
                    <div class="bg-muted rounded-full p-2">
                        <Avatar class="size-14">
                            <AvatarImage
                                src={session?.picture}
                                referrerpolicy="no-referrer"
                            />
                            <AvatarFallback
                                text={session?.name}
                                class="text-lg"
                                charCount={2}
                            />
                        </Avatar>
                    </div>
                    <DotLine />
                    <div class="bg-muted rounded-full p-2">
                        <Avatar class="size-14">
                            {clientIcon && <AvatarImage src={clientIcon} />}
                            <AvatarFallback alwaysShow={!clientIcon}>
                                <Icon icon={Globe} size={36} />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
                <EmptyTitle>Authorize App</EmptyTitle>
                <EmptyDescription>
                    <code class="mr-0.5">{clientId}</code> is requesting access
                    to your info: {scopeEntries}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent class="mt-2 max-w-md">
                <Button
                    variant="outline"
                    size="sm"
                    class="rounded-4xl cursor-pointer"
                    onclick={`event.preventDefault(),(y=(x=this.parentElement.querySelector("#details")).parentElement).style.maxHeight&&"0px"!=y.style.maxHeight?(y.style.maxHeight="0px",y.style.opacity="1"):(y.style.maxHeight=x.offsetHeight+24+"px",y.style.opacity="1")`}
                >
                    What info will be shared?
                </Button>
                <div class="w-full open-transition">
                    <Card id="details" class="w-full text-left">
                        <CardContent class="flex-col gap-4">
                            <div class="flex flex-row gap-1.5">
                                <Icon
                                    icon={Check}
                                    size={20}
                                    class="mt-1 text-muted-foreground"
                                />
                                <div class="flex flex-col gap-1">
                                    <h2 class="font-semibold text-base">
                                        View your User ID
                                    </h2>
                                    <p class="text-muted-foreground">
                                        View your unique identity ID for{" "}
                                        <code class="ml-0.5 sm:whitespace-nowrap">
                                            {clientId}
                                        </code>
                                    </p>
                                </div>
                            </div>
                            {scopes.includes("profile") && (
                                <div class="flex flex-row gap-1.5">
                                    <Icon
                                        icon={Check}
                                        size={20}
                                        class="mt-1 text-muted-foreground"
                                    />
                                    <div class="flex flex-col gap-1">
                                        <h2 class="font-semibold text-base">
                                            View your profile info
                                        </h2>
                                        <p class="text-muted-foreground">
                                            Name:{" "}
                                            <code class="ml-0.5">
                                                {session?.name}
                                            </code>
                                        </p>
                                        {session?.picture && (
                                            <div class="text-muted-foreground flex items-center">
                                                Picture:
                                                <Avatar class="ml-1 size-4">
                                                    <AvatarImage
                                                        src={session?.picture}
                                                        referrerpolicy="no-referrer"
                                                    />
                                                    <AvatarFallback
                                                        text={session?.name}
                                                        charCount={1}
                                                    />
                                                </Avatar>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {scopes.includes("email") && (
                                <div class="flex flex-row gap-1.5">
                                    <Icon
                                        icon={Check}
                                        size={20}
                                        class="mt-1 text-muted-foreground"
                                    />
                                    <div class="flex flex-col gap-1">
                                        <h2 class="font-semibold text-base">
                                            View your email address
                                        </h2>
                                        <p class="text-muted-foreground">
                                            Email address:{" "}
                                            <code class="ml-0.5">
                                                {session?.email}
                                            </code>
                                        </p>
                                        <p class="text-muted-foreground">
                                            Email verified:{" "}
                                            <code class="ml-0.5">
                                                {session?.email_verified?.toString()}
                                            </code>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div class="w-full flex flex-col-reverse sm:flex-row justify-center mt-4 gap-2.5">
                    <Button
                        asChild={true}
                        variant="outline"
                        class="shrink-0 sm:flex-1 cursor-pointer"
                    >
                        <a href={cancelUrl}>Cancel</a>
                    </Button>
                    <form class="contents" method="post">
                        <input type="hidden" name="result" value="allow" />
                        <Button
                            type="submit"
                            variant="primary"
                            class="shrink-0 sm:flex-1 cursor-pointer relative disabled:opacity-75"
                            disabled
                        >
                            <div class="absolute rounded-lg overflow-clip w-full h-full -mx-5 flex justify-end pointer-events-none">
                                <div class="w-full h-full bg-black/30 animate-buttonbar" />
                            </div>
                            Allow
                        </Button>
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `p=document.currentScript?.parentElement,b=p?.querySelector('button[type="submit"]');b?.setAttribute("disabled","");document.currentScript?.remove();setTimeout(()=>b?.removeAttribute("disabled"),1500)`,
                            }}
                        />
                    </form>
                </div>
            </EmptyContent>
        </Empty>
    );
}
