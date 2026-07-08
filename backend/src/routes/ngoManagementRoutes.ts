import { Router } from 'express';
import type { RequestHandler } from 'express';
import { User } from '../models/User';
import { NGOProfile } from '../models/NGOProfile';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { ApiError } from '../utils/errors';
import { authenticateAdmin, authorizePermission } from '../middleware/adminAuth';
import { Admin } from '../models/Admin';

const router = Router();

function getIp(req: import('express').Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
}

async function logAudit(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  targetName: string,
  reason: string,
  ip: string
) {
  const admin = await Admin.findById(adminId);
  await AuditLog.create({
    adminId,
    adminEmail: admin?.email || '',
    adminName: `${admin?.firstName || ''} ${admin?.lastName || ''}`,
    action,
    targetType,
    targetId,
    targetName,
    reason,
    ip,
    device: '',
  });
}

// List NGOs with filters
const listNGOs: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string | undefined;
    const verificationStatus = req.query.verificationStatus as string | undefined;

    const query: Record<string, unknown> = { role: 'ngo' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (verificationStatus) query.verificationStatus = verificationStatus;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    // Fetch NGO profiles for these users
    const userIds = users.map((u) => u._id);
    const profiles = await NGOProfile.find({ user: { $in: userIds } });
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const ngos = users.map((u) => {
      const profile = profileMap.get(u._id.toString());
      return {
        id: u._id.toString(),
        ngoName: profile?.ngoName || u.firstName,
        email: u.email,
        phone: u.phone,
        registrationNumber: profile?.registrationNumber || '',
        website: profile?.website || '',
        description: profile?.description || '',
        status: u.status,
        verificationStatus: u.verificationStatus,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
      };
    });

    res.json({ ngos, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const getNGO: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ngo') throw new ApiError(404, 'NGO not found', 'NOT_FOUND');
    const profile = await NGOProfile.findOne({ user: user._id });
    res.json({
      ngo: {
        id: user._id.toString(),
        ngoName: profile?.ngoName || user.firstName,
        email: user.email,
        phone: user.phone,
        registrationNumber: profile?.registrationNumber || '',
        website: profile?.website || '',
        description: profile?.description || '',
        status: user.status,
        verificationStatus: user.verificationStatus,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
};

const approveNGO: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ngo') throw new ApiError(404, 'NGO not found', 'NOT_FOUND');
    user.verificationStatus = 'approved';
    user.status = 'active';
    await user.save();

    await logAudit(req.admin.id, 'ngo_approve', 'ngo', user._id.toString(), user.firstName, 'NGO approved', getIp(req));
    await Notification.create({
      recipientId: null,
      type: 'ngo_approval',
      title: 'NGO Approved',
      message: `${user.firstName} has been approved`,
      link: `/admin/ngos/${user._id}`,
    });

    res.json({ message: 'NGO approved successfully' });
  } catch (err) {
    next(err);
  }
};

const rejectNGO: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ngo') throw new ApiError(404, 'NGO not found', 'NOT_FOUND');
    user.verificationStatus = 'rejected';
    await user.save();

    await logAudit(req.admin.id, 'ngo_reject', 'ngo', user._id.toString(), user.firstName, req.body.reason || 'NGO rejected', getIp(req));
    await Notification.create({
      recipientId: null,
      type: 'ngo_rejection',
      title: 'NGO Rejected',
      message: `${user.firstName} has been rejected`,
      link: `/admin/ngos/${user._id}`,
    });

    res.json({ message: 'NGO rejected successfully' });
  } catch (err) {
    next(err);
  }
};

const suspendNGO: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ngo') throw new ApiError(404, 'NGO not found', 'NOT_FOUND');
    user.status = 'blocked';
    user.isBlocked = true;
    await user.save();

    await logAudit(req.admin.id, 'ngo_suspend', 'ngo', user._id.toString(), user.firstName, req.body.reason || 'NGO suspended', getIp(req));
    res.json({ message: 'NGO suspended successfully' });
  } catch (err) {
    next(err);
  }
};

const reactivateNGO: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ngo') throw new ApiError(404, 'NGO not found', 'NOT_FOUND');
    user.status = 'active';
    user.isBlocked = false;
    await user.save();

    await logAudit(req.admin.id, 'ngo_reactivate', 'ngo', user._id.toString(), user.firstName, 'NGO reactivated', getIp(req));
    res.json({ message: 'NGO reactivated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteNGO: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ngo') throw new ApiError(404, 'NGO not found', 'NOT_FOUND');
    await NGOProfile.deleteOne({ user: user._id });
    await User.findByIdAndDelete(user._id);

    await logAudit(req.admin.id, 'ngo_delete', 'ngo', user._id.toString(), user.firstName, req.body.reason || 'NGO deleted', getIp(req));
    res.json({ message: 'NGO deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const requestDocs: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'ngo') throw new ApiError(404, 'NGO not found', 'NOT_FOUND');

    await logAudit(req.admin.id, 'ngo_request_docs', 'ngo', user._id.toString(), user.firstName, req.body.message || 'Documents requested', getIp(req));
    await Notification.create({
      recipientId: null,
      type: 'system',
      title: 'Documents Requested',
      message: `Additional documents requested for ${user.firstName}`,
      link: `/admin/ngos/${user._id}`,
    });

    res.json({ message: 'Document request sent' });
  } catch (err) {
    next(err);
  }
};

// All NGO routes require admin auth
router.use(authenticateAdmin);

router.get('/', listNGOs);
router.get('/:id', getNGO);
router.post('/:id/approve', authorizePermission('ngo:approve'), approveNGO);
router.post('/:id/reject', authorizePermission('ngo:reject'), rejectNGO);
router.post('/:id/suspend', authorizePermission('ngo:suspend'), suspendNGO);
router.post('/:id/reactivate', authorizePermission('ngo:suspend'), reactivateNGO);
router.delete('/:id', authorizePermission('ngo:delete'), deleteNGO);
router.post('/:id/request-docs', authorizePermission('ngo:approve'), requestDocs);

export default router;
