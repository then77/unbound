import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@unbound/web/components/empty";
import { Button } from "@unbound/web/components/button";

import { UserRound } from "@lucide/icons";
import { Icon } from "@unbound/web/components/icon";
import {
    GoogleLogo,
    GithubLogo,
    DiscordLogo,
} from "@unbound/web/components/brands";

import type { UserProvider } from "@unbound/types";

type LoginPageProps = {
    providers: Record<UserProvider, boolean>;
    redirect?: string | null;
    loggedIn?: boolean;
};

function getClientOrigin(redirect: string): string | null {
    try {
        const params = new URLSearchParams(redirect.split("?")[1]);
        const clientId = params.get("client_id");
        if (!clientId) return null;

        const originPrefix = "origin:";
        if (clientId.startsWith(originPrefix)) {
            return clientId.slice(originPrefix.length);
        }

        return clientId;
    } catch {
        return null;
    }
}

export function LoginPage({ providers, redirect, loggedIn }: LoginPageProps) {
    let clientId = redirect ? getClientOrigin(redirect) : null;

    function make(provider: string) {
        const params = new URLSearchParams();

        if (redirect) {
            params.set("redirect_to", redirect);
        }

        const query = params.toString();
        return `/auth/${provider}${query ? `?${query}` : ""}`;
    }

    return (
        <div class="flex flex-1 justify-center items-center pb-8">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia>
                        <Icon icon={UserRound} />
                    </EmptyMedia>
                    <EmptyTitle>
                        {loggedIn ? "Switch Account" : "Welcome!"}
                    </EmptyTitle>
                    <EmptyDescription>
                        {clientId ? (
                            <>
                                Choose your identity to continue authorize to{" "}
                                <code class="whitespace-nowrap ml-0.5">
                                    {clientId}
                                </code>
                            </>
                        ) : (
                            "Choose your identity to continue."
                        )}
                    </EmptyDescription>
                    <div class="w-16 h-px bg-muted mt-4" />
                </EmptyHeader>
                <EmptyContent>
                    {providers.google && (
                        <Button asChild={true} variant="outline" class="w-full">
                            <a href={make("google")}>
                                <GoogleLogo size={24} />
                                Login with Google
                            </a>
                        </Button>
                    )}
                    {providers.github && (
                        <Button asChild={true} variant="outline" class="w-full">
                            <a href={make("github")}>
                                <GithubLogo size={24} />
                                Login with Github
                            </a>
                        </Button>
                    )}
                    {providers.discord && (
                        <Button asChild={true} variant="outline" class="w-full">
                            <a href={make("discord")}>
                                <DiscordLogo size={24} />
                                Login with Discord
                            </a>
                        </Button>
                    )}
                </EmptyContent>
            </Empty>
        </div>
    );
}
