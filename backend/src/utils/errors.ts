import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Custom API error with a status code and optional machine-readable code.
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  field?: string;

  constructor(statusCode: number, message: string, code?: string, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.name = 'ApiError';
  }
}

/**
 * 404 handler for unknown routes.
 */
export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
};

/**
 * Global error handler. Never leaks stack traces in production.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      field: err.field,
    });
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as { code?: number }).code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue || {})[0];
    return res.status(409).json({
      message: `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already in use`,
      code: 'DUPLICATE',
      field,
    });
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message,
      code: 'VALIDATION_ERROR',
    });
  }

  // Default: 500, no stack trace in prod
 // Default: 500

console.error("\n========== SERVER ERROR ==========");
console.error(err);
console.error("==================================\n");

return res.status(500).json({
    message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    code: 'SERVER_ERROR',
}); 
}
