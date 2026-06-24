export class UnboundError extends Error {
    public readonly code: string;

    constructor(code: string, message?: string) {
        super(message);
        this.name = "UnboundError";
        this.code = code;
    }
}

export { APIUnboundError } from "@/exceptions/api";
export { AuthUnboundError } from "@/exceptions/auth";