import { UnboundError } from "@/exceptions";

/**
 * API request failures that are not known auth-flow errors.
 */
export type APIUnboundErrorCode = "NETWORK_ERROR" | "SERVER_ERROR" | "UNKNOWN";

/**
 * Error thrown when an Unbound API request fails outside of known auth errors.
 *
 * This error is for failures such as network errors, non-auth server
 * errors like HTTP 500 responses, or unexpected API responses. When available,
 * inspect {@link status} for the HTTP status code and {@link cause} for the
 * original low-level error or response details.
 */
export class APIUnboundError extends UnboundError {
    /**
     * API request error code.
     * 
     * See {@link ApiUnboundErrorCode} for all available codes
     */
    public override readonly code: APIUnboundErrorCode;

    /**
     * HTTP response status code.
     *
     * This is available when error {@link code} is `SERVER_ERROR`.
     */
    public readonly status?: number;

    /** Original error or response details that caused this API error. */
    public readonly cause?: unknown;

    /**
     * Creates a server response error.
     *
     * @param code - Server error code.
     * @param message - Optional error description.
     * @param status - HTTP response status code.
     * @param cause - Optional original error or response details.
     */
    constructor(
        code: "SERVER_ERROR",
        status: number,
        message?: string,
        cause?: unknown,
    );

    /**
     * Creates an API request error without an HTTP response status.
     *
     * @param code - API request error code.
     * @param message - Optional error description.
     * @param cause - Optional original error or response details.
     */
    constructor(
        code: Exclude<APIUnboundErrorCode, "SERVER_ERROR">,
        status?: number,
        message?: string,
        cause?: unknown,
    );

    constructor(
        code: APIUnboundErrorCode,
        status?: number,
        message?: string,
        cause?: unknown,
    ) {
        super(code, message);
        this.name = "APIUnboundError";
        this.code = code;
        this.status = status;
        this.cause = cause;
    }
}
