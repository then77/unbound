import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@unbound/web/components/empty";
import { Card, CardContent } from "@unbound/web/components/card";
import {
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "@unbound/web/components/alert-dialog";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
    AvatarBadge,
} from "@unbound/web/components/avatar";
import { Button } from "@unbound/web/components/button";

import { UserRound } from "@lucide/icons";
import { Icon } from "@unbound/web/components/icon";
import {
    GoogleLogo,
    GithubLogo,
    DiscordLogo,
} from "@unbound/web/components/brands";

import type { Session } from "@unbound/types";

type ProfilePageProps = {
    session: Partial<Session>;
};

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ProfilePage({ session }: ProfilePageProps) {
    return (
        <>
            <Empty class="pb-16">
                <EmptyHeader>
                    <EmptyMedia>
                        <Icon icon={UserRound} />
                    </EmptyMedia>
                    <EmptyTitle>Your Identity</EmptyTitle>
                    <EmptyDescription>
                        Manage your current identity info.
                    </EmptyDescription>
                    <div class="w-16 h-px bg-muted mt-4" />
                </EmptyHeader>
                <EmptyContent class="max-w-lg">
                    <Card class="w-full p-6">
                        <CardContent class="flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-left">
                            <Avatar class="size-12 sm:size-16 mb-4 sm:mb-0">
                                <AvatarImage
                                    src={session?.picture}
                                    referrerpolicy="no-referrer"
                                />
                                <AvatarFallback
                                    text={session?.name}
                                    class="text-lg"
                                    charCount={2}
                                />
                                {session.provider && (
                                    <AvatarBadge
                                        class="bg-border sm:[&>svg]:size-4"
                                        title={`Signed in with ${capitalize(session.provider)}`}
                                    >
                                        {session.provider == "google" ? (
                                            <GoogleLogo />
                                        ) : session.provider == "github" ? (
                                            <GithubLogo />
                                        ) : (
                                            <DiscordLogo />
                                        )}
                                    </AvatarBadge>
                                )}
                            </Avatar>
                            <div class="flex flex-col gap-2 sm:gap-4">
                                <div class="flex flex-row gap-x-2 sm:flex-col">
                                    <h2 class="font-semibold sm:text-base">
                                        Name
                                    </h2>
                                    <p class="text-muted-foreground">
                                        {session.name}
                                    </p>
                                </div>
                                <div class="flex flex-row gap-x-2 sm:flex-col">
                                    <h2 class="font-semibold sm:text-base">
                                        Email
                                    </h2>
                                    <p class="text-muted-foreground">
                                        {session.email}
                                    </p>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2 sm:gap-4">
                                <div class="flex flex-row gap-x-2 sm:flex-col">
                                    <h2 class="font-semibold sm:text-base">
                                        Email verified?
                                    </h2>
                                    <p class="text-muted-foreground">
                                        {session.email_verified?.toString()}
                                    </p>
                                </div>
                                <div>
                                    <h2 class="font-semibold sm:text-base mb-1 sm:mb-0">
                                        User ID
                                    </h2>
                                    <p class="text-muted-foreground">
                                        <code>{session.sub}</code>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div class="w-full flex flex-col-reverse sm:flex-row justify-center mt-4 gap-2.5">
                        <Button
                            variant="outline"
                            class="shrink-0 sm:flex-1 cursor-pointer"
                            onclick={`document.querySelector("#refresh-dialog")?.setAttribute("data-state", "open")`}
                        >
                            Refresh Info
                        </Button>
                        <Button
                            variant="danger"
                            class="shrink-0 sm:flex-1 cursor-pointer"
                            onclick={`document.querySelector("#logout-dialog")?.setAttribute("data-state", "open")`}
                        >
                            Logout
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>

            <AlertDialog id="refresh-dialog">
                <AlertDialogOverlay />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Refresh info?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be redirected to login to refresh your
                            identity info.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="primary" asChild={true}>
                            <a href={`/auth/${session.provider}`}>Refresh</a>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog id="logout-dialog">
                <AlertDialogOverlay />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm logout?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will need to login again later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <form method="post" action="/logout" class="contents">
                            <AlertDialogAction variant="danger" type="submit">
                                Logout
                            </AlertDialogAction>
                        </form>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <script
                dangerouslySetInnerHTML={{
                    __html: `document.addEventListener("click",e=>e.target.closest("[data-alert-dialog-close]")?.closest('[data-slot="alert-dialog"]')?.setAttribute("data-state","closed"))`,
                }}
            />
        </>
    );
}
