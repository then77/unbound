import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@unbound/web/components/avatar";
import { Button } from "@unbound/web/components/button";

import { ArrowRight } from "@lucide/icons";
import { Icon } from "@unbound/web/components/icon";

import type { Session } from "@unbound/types";

type NavbarProps = {
    session?: Partial<Session> | null;
    showLogin?: boolean;
};

function isLoggedIn(session?: Partial<Session> | null) {
    const props: (keyof Session)[] = ["sub", "provider", "name", "email"];
    if (!session) return false;

    return props.every((key) => key in session! && session![key] != null);
}

export function Navbar({ session, showLogin }: NavbarProps) {
    return (
        <div class="w-full py-6 sm:py-8 flex flex-row items-center">
            <div class="flex-1 min-h-12 flex flex-row items-center">
                <a href="/" class="flex flex-row items-center">
                    <img
                        src="/favicon.ico"
                        class="rounded-full size-6 sm:size-7 mr-2 sm:mr-3"
                        onerror={`this.style.display="none"`}
                    />
                    <h1 class="text-xl sm:text-2xl font-extrabold">Unbound</h1>
                </a>
            </div>
            <div class="min-h-12 flex flex-row justify-end items-center">
                {isLoggedIn(session) ? (
                    <Button
                        asChild={true}
                        variant="outline"
                        size="lg"
                        class="px-3 sm:px-4 sm:pr-5 max-w-48"
                    >
                        <a href="/profile">
                            <Avatar class="size-6">
                                <AvatarImage
                                    src={session?.picture}
                                    referrerpolicy="no-referrer"
                                />
                                <AvatarFallback
                                    text={session?.name}
                                    charCount={1}
                                />
                            </Avatar>
                            <p class="hidden sm:block truncate">
                                {session?.name}
                            </p>
                        </a>
                    </Button>
                ) : (
                    showLogin && (
                        <Button
                            asChild={true}
                            variant="outline"
                            size="lg"
                            class="px-4 sm:pl-5 max-w-48"
                        >
                            <a href="/login">
                                <p class="truncate">Login</p>
                                <Icon
                                    icon={ArrowRight}
                                    size={16}
                                    class="hidden sm:block"
                                />
                            </a>
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}
