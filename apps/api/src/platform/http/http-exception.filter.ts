import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  originalUrl: string;
}

interface ResponseLike {
  status(code: number): ResponseLike;
  json(body: unknown): void;
}

interface StructuredErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
    correlationId: string | null;
    path: string;
    timestamp: string;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestLike>();
    const response = context.getResponse<ResponseLike>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const message = this.resolveMessage(exceptionResponse, exception);
    const code = this.resolveCode(exceptionResponse, status);
    const correlationHeader = request.headers["x-correlation-id"];
    const correlationId = Array.isArray(correlationHeader) ? correlationHeader[0] ?? null : correlationHeader ?? null;

    const body: StructuredErrorResponse = {
      error: {
        code,
        message,
        status,
        correlationId,
        path: request.originalUrl,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(body);
  }

  private resolveMessage(exceptionResponse: unknown, exception: unknown): string {
    if (typeof exceptionResponse === "string") return exceptionResponse;
    if (exceptionResponse && typeof exceptionResponse === "object" && "message" in exceptionResponse) {
      const value = (exceptionResponse as { message?: unknown }).message;
      if (typeof value === "string") return value;
      if (Array.isArray(value)) return value.map(String).join("; ");
    }
    if (exception instanceof Error && exception.message) return exception.message;
    return "Unexpected server error";
  }

  private resolveCode(exceptionResponse: unknown, status: number): string {
    if (exceptionResponse && typeof exceptionResponse === "object" && "code" in exceptionResponse) {
      const value = (exceptionResponse as { code?: unknown }).code;
      if (typeof value === "string" && value.length > 0) return value;
    }
    return status === HttpStatus.INTERNAL_SERVER_ERROR ? "INTERNAL_SERVER_ERROR" : `HTTP_${status}`;
  }
}
