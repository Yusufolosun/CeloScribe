import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { logger } from './logger';

export type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Wraps an API handler with:
 * - Request logging
 * - Uncaught error handling (never leaks stack traces to client)
 * - Method validation
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest) => {
    const start = Date.now();
    try {
      const response = await handler(req);
      const duration = Date.now() - start;
      logger.info({ method: req.method, url: req.url, status: response.status, duration });
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error({
        method: req.method,
        url: req.url,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Returns a standardized 405 response for unsupported HTTP methods.
 */
export function methodNotAllowed(allowed: string[]): NextResponse {
  return NextResponse.json(
    { error: `Method not allowed. Supported: ${allowed.join(', ')}` },
    {
      status: 405,
      headers: { Allow: allowed.join(', ') },
    }
  );
}

/**
 * Returns a standardized 400 response for validation errors.
 */
export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Returns a standardized 402 response when payment cannot be verified.
 */
export function paymentRequired(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 402 });
}
