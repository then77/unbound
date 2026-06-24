export class UnboundError extends Error {
    public readonly code: string;

    constructor(code: string, message?: string) {
        super(message);
        this.name = "UnboundError";
        this.code = code;
    }
}
