import { Router } from 'express';
import type { RequestHandler } from 'express';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { ApiError } from '../utils/errors';
import { authenticateAdmin, authorizePermission } from '../middleware/adminAuth';

const router = Router();

const listApplications: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const [apps, total] = await Promise.all([
      Application.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('studentId', 'firstName lastName email').populate('courseId', 'title'),
      Application.countDocuments(query),
    ]);

    res.json({ applications: apps, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const updateApplicationStatus: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes || '' },
      { new: true }
    );
    if (!app) throw new ApiError(404, 'Application not found', 'NOT_FOUND');
    res.json({ application: app, message: 'Application status updated' });
  } catch (err) {
    next(err);
  }
};

router.use(authenticateAdmin);

router.get('/', authorizePermission('application:read'), listApplications);
router.put('/:id/status', authorizePermission('application:update'), updateApplicationStatus);

export default router;
