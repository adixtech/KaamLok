import { Router } from 'express';
import * as ctrl from '../controllers/adminController';
import { validate } from '../middleware/validate';
import { authenticateAdmin, authorizeAdminRole, authorizePermission } from '../middleware/adminAuth';
import {
  createAdminValidators,
  updateAdminValidators,
  resetAdminPasswordValidators,
  suspendAdminValidators,
} from '../validators/adminValidators';

const router = Router();

/**
 * Admin routes — all under /api/admin
 * Auth: JWT cookie + authenticateAdmin middleware
 * RBAC: authorizeAdminRole + authorizePermission
 */

// Auth — login is unified through /api/auth/login (searches both User and Admin collections).
// /me and /logout remain here for admin-specific session resolution (includes permissions).
router.get('/me', authenticateAdmin, ctrl.adminGetMe);
router.post('/logout', authenticateAdmin, ctrl.adminLogout);

// Dashboard
router.get('/dashboard/stats', authenticateAdmin, ctrl.getDashboardStats);
router.get('/analytics', authenticateAdmin, ctrl.getAnalytics);

// Admin management — Super Admin only
router.get('/admins', authenticateAdmin, ctrl.listAdmins);
router.get('/admins/:id', authenticateAdmin, ctrl.getAdmin);
router.get('/admins/:id/login-history', authenticateAdmin, ctrl.getLoginHistory);
router.post(
  '/admins',
  authenticateAdmin,
  authorizeAdminRole('super_admin'),
  createAdminValidators,
  validate,
  ctrl.createAdmin
);
router.put(
  '/admins/:id',
  authenticateAdmin,
  authorizeAdminRole('super_admin'),
  updateAdminValidators,
  validate,
  ctrl.updateAdmin
);
router.post(
  '/admins/:id/suspend',
  authenticateAdmin,
  authorizeAdminRole('super_admin'),
  suspendAdminValidators,
  validate,
  ctrl.suspendAdmin
);
router.post(
  '/admins/:id/reactivate',
  authenticateAdmin,
  authorizeAdminRole('super_admin'),
  ctrl.reactivateAdmin
);
router.delete(
  '/admins/:id',
  authenticateAdmin,
  authorizeAdminRole('super_admin'),
  ctrl.deleteAdmin
);
router.post(
  '/admins/:id/reset-password',
  authenticateAdmin,
  authorizeAdminRole('super_admin'),
  resetAdminPasswordValidators,
  validate,
  ctrl.resetAdminPassword
);

// Audit logs
router.get('/audit-logs', authenticateAdmin, authorizePermission('audit:read'), ctrl.getAuditLogs);

// Notifications
router.get('/notifications', authenticateAdmin, ctrl.getNotifications);
router.put('/notifications/:id/read', authenticateAdmin, ctrl.markNotificationRead);
router.put('/notifications/read-all', authenticateAdmin, ctrl.markAllNotificationsRead);
router.delete('/notifications/:id', authenticateAdmin, ctrl.deleteNotification);

// Settings
router.get('/settings', authenticateAdmin, ctrl.getSettings);
router.put('/settings', authenticateAdmin, authorizePermission('settings:update'), ctrl.updateSetting);

export default router;
