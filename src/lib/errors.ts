import type { ErrorHandler } from "elysia";


export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

interface ErrorDefinition {
  status: number;
  message: string;
}

interface ErrorResponse {          // ← renamed from GlobalError
  status: number;
  message: string;
  body: { message: string };
}


export class GlobalError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode | number,
  ) {
    super(message);
    this.name = code.toString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  BAD_REQUEST: "BAD_REQUEST",
  CONFLICT: "CONFLICT",
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
} as const;


const HTTP_STATUS_TO_CODE: Record<number, ErrorCode> = {
  400: ErrorCodes.BAD_REQUEST,
  401: ErrorCodes.UNAUTHORIZED,
  402: ErrorCodes.PAYMENT_REQUIRED,
  403: ErrorCodes.FORBIDDEN,
  404: ErrorCodes.NOT_FOUND,
  409: ErrorCodes.CONFLICT,
  422: ErrorCodes.UNPROCESSABLE_ENTITY,
  500: ErrorCodes.INTERNAL_SERVER_ERROR,
};


const ERROR_DEFINITIONS: Record<ErrorCode, ErrorDefinition> = {
  [ErrorCodes.NOT_FOUND]:             { status: 404, message: "Not Found" },
  [ErrorCodes.UNAUTHORIZED]:          { status: 401, message: "Unauthorized" },
  [ErrorCodes.FORBIDDEN]:             { status: 403, message: "Forbidden" },
  [ErrorCodes.BAD_REQUEST]:           { status: 400, message: "Bad Request" },
  [ErrorCodes.CONFLICT]:              { status: 409, message: "Conflict" },
  [ErrorCodes.UNPROCESSABLE_ENTITY]:  { status: 422, message: "Unprocessable Entity" },
  [ErrorCodes.INTERNAL_SERVER_ERROR]: { status: 500, message: "Internal Server Error" },
  [ErrorCodes.PAYMENT_REQUIRED]:      { status: 402, message: "Payment Required" },
};


export const globalErrors: ErrorHandler = ({ code, error, set }): ErrorResponse => {
  const errorCode: ErrorCode =
    typeof code === "number"
      ? (HTTP_STATUS_TO_CODE[code] ?? ErrorCodes.INTERNAL_SERVER_ERROR)
      : (ERROR_DEFINITIONS[code as ErrorCode]
          ? (code as ErrorCode)
          : ErrorCodes.INTERNAL_SERVER_ERROR);

  const definition = ERROR_DEFINITIONS[errorCode];

  set.status = definition.status;

  return {
    status:  definition.status,
    message: definition.message,
    body: {
      message: (error as Error)?.message ?? "An unexpected error occurred.",
    },
  };
};