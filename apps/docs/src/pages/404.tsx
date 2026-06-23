import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { CircleQuestionMark, House } from "lucide-react";

export default function NotFoundPage() {
    return (
        <main className="flex min-h-screen flex-1 items-center justify-center px-6 pb-8">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia className="mb-6 bg-warning-background text-warning">
                        <CircleQuestionMark className="-mb-px" />
                    </EmptyMedia>
                    <EmptyTitle>404 Not Found</EmptyTitle>
                    <EmptyDescription>
                        This page does not exist. Check the URL and try again.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="mt-8 max-w-xs flex-row justify-center">
                    <Button
                        asChild={true}
                        variant="outline"
                        className="cursor-pointer"
                    >
                        <a href="/docs">
                            <House className="size-4" />
                            Back to Docs
                        </a>
                    </Button>
                </EmptyContent>
            </Empty>
        </main>
    );
}
