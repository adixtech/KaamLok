import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/errors';

/**
 * Runs after express-validator chains. Collects all validation errors
 * and returns them in a single 422 response.
 */
export const validate: RequestHandler = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const first = errors.array()[0];
  const message = first.msg || 'Validation failed';
  next(new ApiError(422, message, 'VALIDATION_ERROR', (first as { path?: string }).path));
};
