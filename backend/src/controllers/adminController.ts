import type { RequestHandler } from 'express';
import { adminService } from '../services/adminService';
import { clearAuthCookie } from '../utils/cookie';
import { ApiError } from '../utils/errors';

function getIp(req: import('express').Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
}

function getDevice(req: import('express').Request): string {
  return req.headers['user-agent'] || '';
}

export const adminGetMe: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await adminService.getMe(req.admin.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const adminLogout: RequestHandler = async (req, res, next) => {
  try {
    if (req.admin) {
      await adminService.logout(req.admin.id, getIp(req), getDevice(req));
    }
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const createAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await adminService.createAdmin({ ...req.body, createdBy: req.admin.id });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const listAdmins: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = (req.query.search as string) || '';
    const result = await adminService.listAdmins(page, limit, search);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAdmin: RequestHandler = async (req, res, next) => {
  try {
    const result = await adminService.getAdmin(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await adminService.updateAdmin(req.params.id, req.body, req.admin.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const suspendAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await adminService.suspendAdmin(req.params.id, req.body.reason || '', req.admin.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const reactivateAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await adminService.reactivateAdmin(req.params.id, req.admin.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await adminService.deleteAdmin(req.params.id, req.body.reason || '', req.admin.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const resetAdminPassword: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await adminService.resetAdminPassword(req.params.id, req.body.password, req.admin.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getLoginHistory: RequestHandler = async (req, res, next) => {
  try {
    const result = await adminService.getLoginHistory(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats: RequestHandler = async (_req, res, next) => {
  try {
    const result = await adminService.getDashboardStats();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAnalytics: RequestHandler = async (req, res, next) => {
  try {
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'monthly';
    const result = await adminService.getAnalytics(period);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const action = req.query.action as string | undefined;
    const adminId = req.query.adminId as string | undefined;
    const result = await adminService.getAuditLogs(page, limit, action, adminId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getNotifications: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const unreadOnly = req.query.unread === 'true';
    const result = await adminService.getNotifications(page, limit, unreadOnly);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead: RequestHandler = async (req, res, next) => {
  try {
    const result = await adminService.markNotificationRead(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead: RequestHandler = async (_req, res, next) => {
  try {
    const result = await adminService.markAllNotificationsRead();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteNotification: RequestHandler = async (req, res, next) => {
  try {
    const result = await adminService.deleteNotification(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getSettings: RequestHandler = async (_req, res, next) => {
  try {
    const result = await adminService.getSettings();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateSetting: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await adminService.updateSetting(req.body.key, req.body.value, req.admin.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
