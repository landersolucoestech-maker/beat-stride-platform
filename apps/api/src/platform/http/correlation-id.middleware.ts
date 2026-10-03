import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

const CORRELATION_HEADER = "x-correlation-id";

export class CorrelationIdMiddleware {
  readonly use = (request: Request, response: Response, next: NextFunction): void => {
    const incoming = request.header(CORRELATION_HEADER);
    const correlationId = incoming?.trim() || randomUUID();

    response.setHeader(CORRELATION_HEADER, correlationId);
    next();
  };
}
