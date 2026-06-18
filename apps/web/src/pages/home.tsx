import { Button } from "@unbound/web/components/button";
import { IntroIllustration } from "@unbound/web/components/intro-illust";

import { CircleUserRound, ArrowRight } from "@lucide/icons";
import { Icon } from "@unbound/web/components/icon";

export function HomePage() {
    return (
        <>
            <section class="w-full relative">
                <div class="absolute right-0 w-full max-w-xl h-full pb-32 hidden lg:flex justify-center items-center">
                    <IntroIllustration class="max-w-md xl:max-w-lg" />
                </div>
                <div class="max-w-3xl flex flex-col justify-center gap-8 pt-24 pb-40 text-left">
                    <h1 class="max-w-lg text-5xl sm:text-6xl text-balance font-extrabold leading-12 sm:leading-18">
                        <b class="text-primary-foreground [&_svg]:size-12 sm:[&_svg]:size-14">
                            <Icon
                                icon={CircleUserRound}
                                class="inline mr-2 -mt-3 sm:-mt-4"
                            />
                            Auth
                        </b>{" "}
                        without the{" "}
                        <span class="underline decoration-wavy decoration-warning">
                            baggage
                        </span>
                        .
                    </h1>
                    <p class="text-lg">
                        No signup, No complicated setup,{" "}
                        <b>Just plug and use.</b>
                    </p>
                    <div class="flex flex-row items-center gap-2.5">
                        <Button asChild={true} variant="primary">
                            <a href="#get-started">
                                Get Started <Icon icon={ArrowRight} />
                            </a>
                        </Button>
                        <Button asChild={true} variant="outline">
                            <a href="https://docs.unbound.rlzy.me">
                                Learn More
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
            <section class="w-full border border-muted py-8 px-8 text-left mb-8">
                This content is in development and will be filled in later time.
                Dont worry, some feature however, is already working. You only need to go deep further for now.
            </section>
        </>
    );
}
