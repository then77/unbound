import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@unbound/web/components/avatar";
import { Button } from "@unbound/web/components/button";

import type { Session } from "@unbound/types";

type NavbarProps = {
    session?: Partial<Session> | null;
};

function isLoggedIn(session?: Partial<Session> | null) {
    const props: (keyof Session)[] = ["sub", "provider", "name", "email"];
    if (!session) return false;

    return props.every((key) => key in session! && session![key] != null);
}

export function Navbar({ session }: NavbarProps) {
    return (
        <div class="w-full py-8 flex flex-row items-center">
            <div class="flex-1 min-h-12 flex flex-row items-center">
                <h1 class="text-2xl font-extrabold">Unbound</h1>
            </div>
            <div class="min-h-12 flex flex-row justify-end items-center">
                {isLoggedIn(session) && (
                    <Button
                        asChild={true}
                        variant="outline"
                        size="lg"
                        class="px-4 pr-5 max-w-48"
                    >
                        <a href="/profile">
                            <Avatar class="size-6">
                                <AvatarImage
                                    src={session?.picture}
                                    referrerpolicy="no-referrer"
                                />
                                <AvatarFallback text={session?.name} />
                            </Avatar>
                            <p class="truncate">{session?.name}</p>
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
