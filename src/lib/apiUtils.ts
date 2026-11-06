import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import logger from './logger';

export interface ApiHandlerOptions<T> {
  schema?: ZodSchema<T>;
}

export type ApiHandler<T = unknown> = (
  request: NextRequest,
  validatedData: T
) => Promise<NextResponse>;

export function createApiHandler<T = unknown>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions<T> = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const method = request.method;
    const path = request.nextUrl.pathname;

    try {
      logger.api.request(method, path);

      let validatedData: T = {} as T;

      if (options.schema) {
        const body = await request.json();
        validatedData = options.schema.parse(body);
      }

      const response = await handler(request, validatedData);

      const duration = Date.now() - startTime;
      logger.api.response(method, path, response.status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof ZodError) {
        logger.api.response(method, path, 400, duration);
        return NextResponse.json(
          {
            error: 'Validation error',
            details: error.issues.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      logger.api.error(method, path, error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  };
}
