import { UnboundError } from "@/exceptions";

export type APIUnboundErrorCode = "NETWORK_ERROR" | "SERVER_ERROR" | "UNKNOWN";

export class APIUnboundError extends UnboundError {
    public override readonly code: APIUnboundErrorCode;
    public readonly status?: number;
    public readonly cause?: unknown;

    constructor(
        code: APIUnboundErrorCode,
        message?: string,
        status?: number,
        cause?: unknown,
    ) {
        super(code, message);
        this.name = "APIUnboundError";
        this.code = code;
        this.status = status;
        this.cause = cause;
    }
}
