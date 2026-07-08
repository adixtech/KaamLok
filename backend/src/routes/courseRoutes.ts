import { Router } from 'express';
import type { RequestHandler } from 'express';
import { Course } from '../models/Course';
import { ApiError } from '../utils/errors';
import { authenticateAdmin, authorizePermission } from '../middleware/adminAuth';

const router = Router();

const listCourses: RequestHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;

    const query: Record<string, unknown> = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    if (category) query.category = { $regex: category, $options: 'i' };

    const [courses, total] = await Promise.all([
      Course.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Course.countDocuments(query),
    ]);

    res.json({ courses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const getCourse: RequestHandler = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

const createCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.admin) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const course = await Course.create({ ...req.body, createdBy: req.admin.id });
    res.status(201).json({ course, message: 'Course created successfully' });
  } catch (err) {
    next(err);
  }
};

const updateCourse: RequestHandler = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');
    res.json({ course, message: 'Course updated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteCourse: RequestHandler = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};

router.use(authenticateAdmin);

router.get('/', listCourses);
router.get('/:id', getCourse);
router.post('/', authorizePermission('course:create'), createCourse);
router.put('/:id', authorizePermission('course:update'), updateCourse);
router.delete('/:id', authorizePermission('course:delete'), deleteCourse);

export default router;
