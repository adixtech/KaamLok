import { Router } from 'express';
import type { RequestHandler } from 'express';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { AuditLog } from '../models/AuditLog';
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

const listStudents: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string | undefined;
    const state = req.query.state as string | undefined;
    const city = req.query.city as string | undefined;

    const query: Record<string, unknown> = { role: 'student' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    if (state || city) {
      const profileQuery: Record<string, unknown> = {};
      if (state) profileQuery.state = { $regex: state, $options: 'i' };
      if (city) profileQuery.city = { $regex: city, $options: 'i' };
      const profiles = await StudentProfile.find(profileQuery).select('user');
      query._id = { $in: profiles.map((p) => p.user) };
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const userIds = users.map((u) => u._id);
    const profiles = await StudentProfile.find({ user: { $in: userIds } });
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const students = users.map((u) => {
      const profile = profileMap.get(u._id.toString());
      return {
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        status: u.status,
        emailVerified: u.emailVerified,
        education: profile?.education || '',
        city: profile?.city || '',
        state: profile?.state || '',
        skills: profile?.skills || [],
        createdAt: u.createdAt,
        lastLogin: u.lastLogin,
      };
    });

    res.json({ students, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const getStudent: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'student') throw new ApiError(404, 'Student not found', 'NOT_FOUND');
    const profile = await StudentProfile.findOne({ user: user._id });
    res.json({
      student: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        emailVerified: user.emailVerified,
        education: profile?.education || '',
        city: profile?.city || '',
        state: profile?.state || '',
        skills: profile?.skills || [],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
};

const blockStudent: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'student') throw new ApiError(404, 'Student not found', 'NOT_FOUND');
    user.status = 'blocked';
    user.isBlocked = true;
    await user.save();

    await logAudit(req.admin.id, 'student_block', 'student', user._id.toString(), `${user.firstName} ${user.lastName}`, req.body.reason || 'Student blocked', getIp(req));
    res.json({ message: 'Student blocked successfully' });
  } catch (err) {
    next(err);
  }
};

const reactivateStudent: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'student') throw new ApiError(404, 'Student not found', 'NOT_FOUND');
    user.status = 'active';
    user.isBlocked = false;
    await user.save();

    await logAudit(req.admin.id, 'student_reactivate', 'student', user._id.toString(), `${user.firstName} ${user.lastName}`, 'Student reactivated', getIp(req));
    res.json({ message: 'Student reactivated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteStudent: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'student') throw new ApiError(404, 'Student not found', 'NOT_FOUND');
    await StudentProfile.deleteOne({ user: user._id });
    await User.findByIdAndDelete(user._id);

    await logAudit(req.admin.id, 'student_delete', 'student', user._id.toString(), `${user.firstName} ${user.lastName}`, req.body.reason || 'Student deleted', getIp(req));
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
};

router.use(authenticateAdmin);

router.get('/', listStudents);
router.get('/:id', getStudent);
router.post('/:id/block', authorizePermission('student:block'), blockStudent);
router.post('/:id/reactivate', authorizePermission('student:block'), reactivateStudent);
router.delete('/:id', authorizePermission('student:delete'), deleteStudent);

export default router;
