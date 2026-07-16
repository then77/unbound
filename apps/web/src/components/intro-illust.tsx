export function IntroIllustration({ class: className }: { class?: string }) {
    return (
        <>
            <svg
                id="intro-illust"
                width="540"
                height="480"
                viewBox="0 0 623 397"
                class={className}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
            >
                <g id="intro-1">
                    <rect
                        x="4.5"
                        y="111.5"
                        width="614"
                        height="173"
                        rx="23.5"
                        fill="#151419"
                    />
                    <rect
                        x="4.5"
                        y="111.5"
                        width="614"
                        height="173"
                        rx="23.5"
                        stroke="#2A2638"
                    />
                </g>
            </svg>
            <script src="/intro-illust.js" />
        </>
    );
}
