import { css } from "@unbound/web/lib/utils";

import { Card, CardContent } from "@unbound/web/components/card";

import { Check, Info, CircleAlert, XIcon } from "@lucide/icons";
import { Icon } from "@unbound/web/components/icon";

import type { LucideIconData } from "@lucide/icons";
import type { CardProps } from "@unbound/web/components/card";
import type { Flash } from "@unbound/types";

function generateFlashScript({ sticky, dismissable }: Flash): string | null {
    // If sticky and non dismissable, no script is needed
    if (sticky == true && dismissable != true) return null;
    let base =
        'document.currentScript?.remove();{let e=document.querySelector("#flash"),t=()=>(e.dataset.state="exit",e.onanimationend=()=>e.remove());';
    if (dismissable == true) base += 'e.querySelector("#close").onclick=t;';
    if (sticky != true) base += "let r=5e3,s=Date.now(),i=setTimeout(t,r);e.onmouseenter=()=>{clearTimeout(i);r-=Date.now()-s};e.onmouseleave=()=>{s=Date.now();i=setTimeout(t,r)};";
    return base + "}";
}

export function Flash({ flash }: { flash: Flash }) {
    const scriptContent = generateFlashScript(flash);
    const variantMap: Record<Flash["type"], CardProps["variant"]> = {
        info: "primary",
        success: "success",
        error: "danger",
    };
    const iconMap: Record<Flash["type"], LucideIconData> = {
        info: Info,
        success: Check,
        error: CircleAlert,
    };

    return (
        <div
            id="flash"
            class="w-full fixed z-100 top-6 left-0 right-0 px-8 pointer-events-none flex justify-center"
        >
            <Card
                variant={variantMap[flash.type]}
                class="w-full sm:w-[unset] sm:min-w-sm max-w-lg shadow-sm"
                size="sm"
            >
                <CardContent class="flex-row font-medium px-1 items-center pointer-events-auto">
                    <Icon icon={iconMap[flash.type]} class="size-4 shrink-0" />
                    <p class="flex-1">{flash.message}</p>
                    {flash.dismissable == true && (
                        <button
                            id="close"
                            class="p-1 -m-1 cursor-pointer"
                            type="button"
                            aria-label="Dismiss toast"
                        >
                            <Icon icon={XIcon} class="size-4 shrink-0" />
                        </button>
                    )}
                </CardContent>
            </Card>
            {scriptContent && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: scriptContent,
                    }}
                />
            )}
        </div>
    );
}
