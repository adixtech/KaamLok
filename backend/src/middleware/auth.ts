import type { RequestHandler } from 'express';
import { config } from '../config/env';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/errors';
import { User } from '../models/User';
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
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    console.log("============== AUTH DEBUG ==============");
    console.log("Cookies:", req.cookies);

    const token = req.cookies?.[config.cookie.name];

    console.log("Cookie name:", config.cookie.name);
    console.log("Token:", token);

    if (!token) {
      console.log("NO TOKEN FOUND");
      throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
    }

    const decoded = verifyToken(token);

    console.log("Decoded JWT:", decoded);

    const user = await User.findById(decoded.sub).select("role email status");

    console.log("Mongo User:", user);

    if (!user) {
      throw new ApiError(401, "User no longer exists", "UNAUTHORIZED");
    }

    if (user.status === "blocked") {
      throw new ApiError(403, "Blocked", "BLOCKED");
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err);
    next(new ApiError(401, "Invalid session", "UNAUTHORIZED"));
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
