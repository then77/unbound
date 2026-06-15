type BrandLogoProps = {
    size?: number;
    class?: string;
    "aria-label"?: string;
};

export function GoogleLogo({
    size = 24,
    class: className,
    ...props
}: BrandLogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 16 16"
            class={className}
            aria-hidden={props["aria-label"] ? undefined : "true"}
            aria-label={props["aria-label"]}
            role={props["aria-label"] ? "img" : "presentation"}
        >
            <g fill="none" fill-rule="evenodd" clip-rule="evenodd">
                <path
                    fill="#f44336"
                    opacity=".987"
                    d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86"
                />
                <path
                    fill="#ffc107"
                    opacity=".997"
                    d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92"
                />
                <path
                    fill="#448aff"
                    opacity=".999"
                    d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49"
                />
                <path
                    fill="#43a047"
                    opacity=".993"
                    d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z"
                />
            </g>
        </svg>
    );
}

export function GithubLogo({
    size = 24,
    class: className,
    ...props
}: BrandLogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            class={className}
            aria-hidden={props["aria-label"] ? undefined : "true"}
            aria-label={props["aria-label"]}
            role={props["aria-label"] ? "img" : "presentation"}
        >
            <path
                fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
            />
        </svg>
    );
}

export function DiscordLogo({
    size = 24,
    class: className,
    ...props
}: BrandLogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 -14 128 128"
            class={className}
            aria-hidden={props["aria-label"] ? undefined : "true"}
            aria-label={props["aria-label"]}
            role={props["aria-label"] ? "img" : "presentation"}
        >
            <path
                fill="#5865F2"
                fill-rule="evenodd"
                d="M82.003 0a104.2 104.2 0 0 1 26.402 8.297c14.484 21.63 21.68 46.025 19.023 74.163c-11.082 8.286-21.831 13.313-32.4 16.603a80 80 0 0 1-6.935-11.421a68 68 0 0 0 10.94-5.326a66 66 0 0 1-2.677-2.118c-20.805 9.85-43.684 9.85-64.74 0c-.866.73-1.762 1.44-2.678 2.118a68 68 0 0 0 10.921 5.315a80.5 80.5 0 0 1-6.935 11.422C22.365 95.763 11.626 90.736.544 82.46C-1.722 58.188 2.807 33.566 19.516 8.317A104 104 0 0 1 45.939 0c1.147 2.056 2.506 4.822 3.422 7.022q14.494-2.22 29.26 0A77 77 0 0 1 82.003 0M42.728 41.348c-6.432 0-11.505 5.912-11.505 13.098s5.184 13.087 11.505 13.087c6.432 0 11.505-5.901 11.505-13.087c.11-7.197-5.073-13.098-11.505-13.098M85.244 41.348c-6.432 0-11.505 5.912-11.505 13.098s5.184 13.087 11.505 13.087c6.432 0 11.505-5.901 11.505-13.087c.11-7.197-5.073-13.098-11.505-13.098"
            />
        </svg>
    );
}
