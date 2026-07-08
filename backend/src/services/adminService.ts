import { Admin, type IAdmin, type AdminRole, type Permission, ROLE_PERMISSIONS } from '../models/Admin';
import { AuditLog, type AuditAction } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { NGOProfile } from '../models/NGOProfile';
import { StudentProfile } from '../models/StudentProfile';
import { Course } from '../models/Course';
import { Application } from '../models/Application';
import { Company } from '../models/Company';
import { CSRProject } from '../models/CSRProject';
import { ApiError } from '../utils/errors';

/**
 * Admin service — all business logic for admin authentication and management.
 * Mirrors the authService pattern: controllers stay thin.
 */

function publicAdmin(admin: IAdmin) {
  return {
    id: admin._id.toString(),
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    adminRole: admin.adminRole,
    permissions: admin.permissions,
    isActive: admin.isActive,
    isSuspended: admin.isSuspended,
    lastLogin: admin.lastLogin ? admin.lastLogin.toISOString() : null,
    createdAt: admin.createdAt,
  };
}

async function logAudit(
  adminId: string,
  admin: { email: string; name: string },
  action: AuditAction,
  targetType: string,
  targetId: string,
  targetName: string,
  reason: string,
  ip: string,
  device: string,
  metadata: Record<string, unknown> = {}
) {
  await AuditLog.create({
    adminId,
    adminEmail: admin.email,
    adminName: admin.name,
    action,
    targetType,
    targetId,
    targetName,
    reason,
    metadata,
    ip,
    device,
  });
}

async function createNotification(
  type: 'ngo_approval' | 'ngo_rejection' | 'student_registration' | 'application_received' | 'system' | 'security',
  title: string,
  message: string,
  link = ''
) {
  await Notification.create({ recipientId: null, type, title, message, link });
}

export const adminService = {
  async getMe(adminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new ApiError(404, 'Admin not found', 'ADMIN_NOT_FOUND');
    return { admin: publicAdmin(admin) };
  },

  async logout(adminId: string, ip: string, device: string) {
    const admin = await Admin.findById(adminId);
    if (admin) {
      await logAudit(
        adminId,
        { email: admin.email, name: `${admin.firstName} ${admin.lastName}` },
        'admin_logout',
        'admin',
        adminId,
        `${admin.firstName} ${admin.lastName}`,
        'Admin logout',
        ip,
        device
      );
    }
    return { message: 'Logged out successfully' };
  },

  async createAdmin(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    adminRole: AdminRole;
    createdBy: string;
  }) {
    const existing = await Admin.findOne({ email: input.email });
    if (existing) throw new ApiError(409, 'Admin with this email already exists', 'DUPLICATE_EMAIL');

    const permissions = ROLE_PERMISSIONS[input.adminRole] || [];
    const admin = await Admin.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password,
      adminRole: input.adminRole,
      permissions,
      isActive: true,
      isSuspended: false,
      createdBy: input.createdBy,
    });

    const creator = await Admin.findById(input.createdBy);
    await logAudit(
      input.createdBy,
      { email: creator?.email || '', name: `${creator?.firstName || ''} ${creator?.lastName || ''}` },
      'admin_create',
      'admin',
      admin._id.toString(),
      `${admin.firstName} ${admin.lastName}`,
      `Created admin with role: ${input.adminRole}`,
      '', ''
    );

    return { admin: publicAdmin(admin), message: 'Admin created successfully' };
  },

  async listAdmins(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const [admins, total] = await Promise.all([
      Admin.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Admin.countDocuments(query),
    ]);
    return {
      admins: admins.map(publicAdmin),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async getAdmin(id: string) {
    const admin = await Admin.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found', 'ADMIN_NOT_FOUND');
    return { admin: publicAdmin(admin) };
  },

  async updateAdmin(id: string, updates: Partial<{ firstName: string; lastName: string; adminRole: AdminRole; permissions: Permission[] }>, updatedBy: string) {
    const admin = await Admin.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found', 'ADMIN_NOT_FOUND');
    if (admin.adminRole === 'super_admin' && updates.adminRole && updates.adminRole !== 'super_admin') {
      throw new ApiError(400, 'Cannot change super admin role', 'CANNOT_DEMOTE_SUPER_ADMIN');
    }
    if (updates.firstName) admin.firstName = updates.firstName;
    if (updates.lastName) admin.lastName = updates.lastName;
    if (updates.adminRole && updates.adminRole !== admin.adminRole) {
      admin.adminRole = updates.adminRole;
      admin.permissions = ROLE_PERMISSIONS[updates.adminRole] || [];
    }
    if (updates.permissions) admin.permissions = updates.permissions;
    await admin.save();

    const updater = await Admin.findById(updatedBy);
    await logAudit(
      updatedBy,
      { email: updater?.email || '', name: `${updater?.firstName || ''} ${updater?.lastName || ''}` },
      'admin_update',
      'admin',
      id,
      `${admin.firstName} ${admin.lastName}`,
      `Updated admin fields`,
      '', ''
    );

    return { admin: publicAdmin(admin), message: 'Admin updated successfully' };
  },

  async suspendAdmin(id: string, reason: string, suspendedBy: string) {
    const admin = await Admin.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found', 'ADMIN_NOT_FOUND');
    if (admin.adminRole === 'super_admin') throw new ApiError(400, 'Cannot suspend super admin', 'CANNOT_SUSPEND_SUPER_ADMIN');
    admin.isSuspended = true;
    admin.isActive = false;
    await admin.save();

    const suspender = await Admin.findById(suspendedBy);
    await logAudit(
      suspendedBy,
      { email: suspender?.email || '', name: `${suspender?.firstName || ''} ${suspender?.lastName || ''}` },
      'admin_suspend',
      'admin',
      id,
      `${admin.firstName} ${admin.lastName}`,
      reason,
      '', ''
    );

    return { message: 'Admin suspended successfully' };
  },

  async reactivateAdmin(id: string, reactivatedBy: string) {
    const admin = await Admin.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found', 'ADMIN_NOT_FOUND');
    admin.isSuspended = false;
    admin.isActive = true;
    await admin.save();

    const reactivator = await Admin.findById(reactivatedBy);
    await logAudit(
      reactivatedBy,
      { email: reactivator?.email || '', name: `${reactivator?.firstName || ''} ${reactivator?.lastName || ''}` },
      'admin_reactivate',
      'admin',
      id,
      `${admin.firstName} ${admin.lastName}`,
      'Admin reactivated',
      '', ''
    );

    return { message: 'Admin reactivated successfully' };
  },

  async deleteAdmin(id: string, reason: string, deletedBy: string) {
    const admin = await Admin.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found', 'ADMIN_NOT_FOUND');
    if (admin.adminRole === 'super_admin') throw new ApiError(400, 'Cannot delete super admin', 'CANNOT_DELETE_SUPER_ADMIN');
    await Admin.findByIdAndDelete(id);

    const deleter = await Admin.findById(deletedBy);
    await logAudit(
      deletedBy,
      { email: deleter?.email || '', name: `${deleter?.firstName || ''} ${deleter?.lastName || ''}` },
      'admin_delete',
      'admin',
      id,
      `${admin.firstName} ${admin.lastName}`,
      reason,
      '', ''
    );

    return { message: 'Admin deleted successfully' };
  },

  async resetAdminPassword(id: string, newPassword: string, resetBy: string) {
    const admin = await Admin.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found', 'ADMIN_NOT_FOUND');
    admin.password = newPassword;
    await admin.save();

    const resetter = await Admin.findById(resetBy);
    await logAudit(
      resetBy,
      { email: resetter?.email || '', name: `${resetter?.firstName || ''} ${resetter?.lastName || ''}` },
      'admin_reset_password',
      'admin',
      id,
      `${admin.firstName} ${admin.lastName}`,
      'Password reset by super admin',
      '', ''
    );

    return { message: 'Password reset successfully' };
  },

  async getLoginHistory(id: string) {
    const admin = await Admin.findById(id);
    if (!admin) throw new ApiError(404, 'Admin not found', 'ADMIN_NOT_FOUND');
    return { history: admin.loginHistory };
  },

  // ─── Dashboard Stats ──────────────────────────────────────────

  async getDashboardStats() {
    const [
      totalStudents, verifiedStudents, pendingStudents, blockedStudents,
      totalNGOs, pendingNGOs, approvedNGOs, rejectedNGOs, blockedNGOs,
      totalCourses, publishedCourses, activeApplications,
      totalAdmins, activeAdmins,
      totalCompanies, activeCSRProjects,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', emailVerified: true }),
      User.countDocuments({ role: 'student', emailVerified: false }),
      User.countDocuments({ role: 'student', status: 'blocked' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'ngo', verificationStatus: 'pending' }),
      User.countDocuments({ role: 'ngo', verificationStatus: 'approved' }),
      User.countDocuments({ role: 'ngo', verificationStatus: 'rejected' }),
      User.countDocuments({ role: 'ngo', status: 'blocked' }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Application.countDocuments({ status: 'pending' }),
      Admin.countDocuments(),
      Admin.countDocuments({ isActive: true, isSuspended: false }),
      Company.countDocuments(),
      CSRProject.countDocuments({ status: 'active' }),
    ]);

    // Login stats
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dailyLogins, weeklyLogins, monthlyLogins] = await Promise.all([
      User.countDocuments({ lastLogin: { $gte: dayAgo } }),
      User.countDocuments({ lastLogin: { $gte: weekAgo } }),
      User.countDocuments({ lastLogin: { $gte: monthAgo } }),
    ]);

    // Recent activities (audit logs)
    const recentActivities = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select('adminName action targetType targetName timestamp');

    // Recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type title message isRead createdAt');

    return {
      students: { total: totalStudents, verified: verifiedStudents, pending: pendingStudents, blocked: blockedStudents },
      ngos: { total: totalNGOs, pending: pendingNGOs, approved: approvedNGOs, rejected: rejectedNGOs, blocked: blockedNGOs },
      courses: { total: totalCourses, published: publishedCourses },
      applications: { active: activeApplications },
      admins: { total: totalAdmins, active: activeAdmins },
      companies: { total: totalCompanies },
      csr: { activeProjects: activeCSRProjects },
      logins: { daily: dailyLogins, weekly: weeklyLogins, monthly: monthlyLogins },
      recentActivities,
      recentNotifications,
      systemHealth: {
        server: 'operational',
        database: 'operational',
        storage: { used: 0, total: 10240, unit: 'MB' },
      },
    };
  },

  // ─── Analytics ────────────────────────────────────────────────

  async getAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    const now = new Date();
    let groupBy: Record<string, unknown>;
    let startDate: Date;

    if (period === 'daily') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
    } else if (period === 'weekly') {
      startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' },
      };
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear() - 5, 0, 1);
      groupBy = { year: { $year: '$createdAt' } };
    } else {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    }

    const [userGrowth, ngoGrowth, applicationGrowth, coursePopularity, stateWise, genderDist] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate }, role: 'student' } },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate }, role: 'ngo' } },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Course.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      StudentProfile.aggregate([
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: { _id: null, total: { $sum: 1 } } },
      ]),
    ]);

    return {
      period,
      userGrowth,
      ngoGrowth,
      applicationGrowth,
      coursePopularity,
      stateWise,
      genderDist,
      totals: { students: genderDist[0]?.total || 0 },
    };
  },

  // ─── Audit Logs ───────────────────────────────────────────────

  async getAuditLogs(page = 1, limit = 20, action?: string, adminId?: string) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (action) query.action = action;
    if (adminId) query.adminId = adminId;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  // ─── Notifications ────────────────────────────────────────────

  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (unreadOnly) query.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ isRead: false }),
    ]);

    return {
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      unreadCount,
    };
  },

  async markNotificationRead(id: string) {
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return { message: 'Notification marked as read' };
  },

  async markAllNotificationsRead() {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(id: string) {
    await Notification.findByIdAndDelete(id);
    return { message: 'Notification deleted' };
  },

  async createNotification(type: 'ngo_approval' | 'ngo_rejection' | 'student_registration' | 'application_received' | 'system' | 'security', title: string, message: string, link = '') {
    await createNotification(type, title, message, link);
    return { message: 'Notification created' };
  },

  // ─── Settings ─────────────────────────────────────────────────

  async getSettings() {
    const { Setting } = await import('../models/Setting');
    const settings = await Setting.find();
    const result: Record<string, unknown> = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    return { settings: result };
  },

  async updateSetting(key: string, value: Record<string, unknown>, updatedBy: string) {
    const { Setting } = await import('../models/Setting');
    await Setting.findOneAndUpdate(
      { key },
      { key, value, updatedBy },
      { upsert: true, new: true }
    );
    const updater = await Admin.findById(updatedBy);
    await logAudit(
      updatedBy,
      { email: updater?.email || '', name: `${updater?.firstName || ''} ${updater?.lastName || ''}` },
      'settings_update',
      'setting',
      key,
      key,
      'Setting updated',
      '', ''
    );
    return { message: 'Setting updated successfully' };
  },
};
