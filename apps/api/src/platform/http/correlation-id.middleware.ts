import { randomUUID } from "node:crypto";

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  setHeader(name: string, value: string): void;
}

type NextFunctionLike = () => void;

const CORRELATION_HEADER = "x-correlation-id";

export class CorrelationIdMiddleware {
  readonly use = (request: RequestLike, response: ResponseLike, next: NextFunctionLike): void => {
    const header = request.headers[CORRELATION_HEADER];
    const incoming = Array.isArray(header) ? header[0] : header;
    const correlationId = incoming?.trim() || randomUUID();

    response.setHeader(CORRELATION_HEADER, correlationId);
    request.headers[CORRELATION_HEADER] = correlationId;
    next();
  };
}
