import type { RequestHandler } from 'express';
import { config } from '../config/env';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/errors';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import type { Role } from '../models/User';

/**
 * Extends Express Request with the authenticated user.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        email: string;
      };
    }
  }
}

/**
 * Requires a valid JWT in the HttpOnly cookie.
 * Attaches the decoded payload to req.user.
 * Resolves both User (student/ngo) and Admin tokens.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[config.cookie.name];
    if (!token) {
      throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    }
    const decoded = verifyToken(token);

    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.sub).select('email adminRole isActive isSuspended');
      if (!admin) throw new ApiError(401, 'Admin no longer exists', 'UNAUTHORIZED');
      if (!admin.isActive || admin.isSuspended) {
        throw new ApiError(403, 'Your admin account has been suspended', 'BLOCKED');
      }
      req.user = { id: decoded.sub, role: 'admin', email: decoded.email };
    } else {
      const user = await User.findById(decoded.sub).select('role email status');
      if (!user) throw new ApiError(401, 'User no longer exists', 'UNAUTHORIZED');
      if (user.status === 'blocked') {
        throw new ApiError(403, 'Your account has been blocked', 'BLOCKED');
      }
      req.user = { id: decoded.sub, role: decoded.role, email: decoded.email };
    }
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Invalid or expired session', 'UNAUTHORIZED'));
  }
};

/**
 * Factory that restricts a route to specific roles.
 * Usage: router.get('/admin', authenticate, authorize('admin'), handler)
 */
export function authorize(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to access this resource', 'FORBIDDEN'));
    }
    next();
  };
}
