import type { LucideIconData } from "@lucide/icons";

type IconProps = {
    icon: LucideIconData;

    size?: number;
    strokeWidth?: number;
    class?: string;

    "aria-label"?: string;
};
type IconNode = LucideIconData["node"][number];

function renderNode([tag, attrs, children]: IconNode, key: number) {
    const childNodes = children?.map(renderNode);

    switch (tag) {
        case "path":
            return (
                <path key={key} {...attrs}>
                    {childNodes}
                </path>
            );
        case "circle":
            return (
                <circle key={key} {...attrs}>
                    {childNodes}
                </circle>
            );
        case "line":
            return (
                <line key={key} {...attrs}>
                    {childNodes}
                </line>
            );
        case "rect":
            return (
                <rect key={key} {...attrs}>
                    {childNodes}
                </rect>
            );
        case "polyline":
            return (
                <polyline key={key} {...attrs}>
                    {childNodes}
                </polyline>
            );
        case "polygon":
            return (
                <polygon key={key} {...attrs}>
                    {childNodes}
                </polygon>
            );
        case "g":
            return (
                <g key={key} {...attrs}>
                    {childNodes}
                </g>
            );
        default:
            return null;
    }
}

export function Icon({
    icon,
    size = 24,
    strokeWidth = 2,
    class: className,
    ...props
}: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
            class={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={props["aria-label"] ? undefined : "true"}
            aria-label={props["aria-label"]}
            role={props["aria-label"] ? "img" : "presentation"}
        >
            {icon.node.map(renderNode)}
        </svg>
    );
}
