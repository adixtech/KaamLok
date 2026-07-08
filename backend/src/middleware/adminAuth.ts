import type { RequestHandler } from 'express';
import { Admin, type AdminRole, type Permission } from '../models/Admin';
import { ApiError } from '../utils/errors';

/**
 * Extends Express Request with the authenticated admin.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        adminRole: AdminRole;
        email: string;
        permissions: Permission[];
      };
    }
  }
}

/**
 * Requires a valid JWT and confirms the user is an admin.
 * Attaches admin info to req.admin for downstream handlers.
 */
export const authenticateAdmin: RequestHandler = async (req, _res, next) => {
  try {
    // Reuse the existing token verification
    const { verifyToken } = await import('../utils/jwt');
    const { config } = await import('../config/env');
    const token = req.cookies?.[config.cookie.name];
    if (!token) throw new ApiError(401, 'Admin authentication required', 'UNAUTHORIZED');

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      throw new ApiError(403, 'Admin access required', 'FORBIDDEN');
    }

    const admin = await Admin.findById(decoded.sub).select('+permissions');
    if (!admin) throw new ApiError(401, 'Admin not found', 'UNAUTHORIZED');
    if (!admin.isActive || admin.isSuspended) {
      throw new ApiError(403, 'Your admin account has been suspended', 'ADMIN_SUSPENDED');
    }

    req.admin = {
      id: admin._id.toString(),
      adminRole: admin.adminRole,
      email: admin.email,
      permissions: admin.permissions,
    };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Invalid or expired admin session', 'UNAUTHORIZED'));
  }
};

/**
 * Restricts a route to specific admin roles.
 * Usage: router.post('/', authenticateAdmin, authorizeAdminRole('super_admin'), handler)
 */
export function authorizeAdminRole(...roles: AdminRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.admin) return next(new ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
    if (!roles.includes(req.admin.adminRole)) {
      return next(new ApiError(403, 'Your role does not permit this action', 'FORBIDDEN'));
    }
    next();
  };
}

/**
 * Permission-based access control.
 * Usage: router.post('/', authenticateAdmin, authorizePermission('ngo:approve'), handler)
 */
export function authorizePermission(permission: Permission): RequestHandler {
  return (req, _res, next) => {
    if (!req.admin) return next(new ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
    if (req.admin.adminRole === 'super_admin') return next();
    if (!req.admin.permissions.includes(permission)) {
      return next(new ApiError(403, `Missing permission: ${permission}`, 'FORBIDDEN'));
    }
    next();
  };
}
