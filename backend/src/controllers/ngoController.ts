import type { RequestHandler } from 'express';
import { ngoService } from '../services/ngoService';
import { ApiError } from '../utils/errors';

/**
 * NGO Controller - HTTP layer for NGO dashboard routes
 */

// ─── Dashboard ──────────────────────────────────────────────────
export const getDashboardStats: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.getDashboardStats(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Courses ─────────────────────────────────────────────────────
export const createCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.createCourse(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.getCourse(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const listCourses: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.listCourses(req.user.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      search: req.query.search as string,
      status: req.query.status as undefined,
      category: req.query.category as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.updateCourse(req.params.id, req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const publishCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.publishCourse(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const pauseCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.pauseCourse(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resumeCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.resumeCourse(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const closeCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.closeCourse(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const archiveCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.archiveCourse(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const duplicateCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.duplicateCourse(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.deleteCourse(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Applications ────────────────────────────────────────────────
export const listApplications: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.listApplications(req.user.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as undefined,
      courseId: req.query.courseId as string,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getApplication: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.getApplication(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const shortlistApplication: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.shortlistApplication(
      req.params.id,
      req.user.id,
      req.user.id,
      req.body.note
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const rejectApplication: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.rejectApplication(
      req.params.id,
      req.user.id,
      req.user.id,
      req.body.reason
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const selectApplication: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.selectApplication(
      req.params.id,
      req.user.id,
      req.user.id,
      req.body.note
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const waitlistApplication: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.waitlistApplication(
      req.params.id,
      req.user.id,
      req.user.id,
      req.body.note
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const startReviewApplication: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.updateApplicationStatus(
      req.params.id,
      req.user.id,
      'under_review',
      req.body.note,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Interviews ──────────────────────────────────────────────────
export const scheduleInterview: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.scheduleInterview(
      req.params.id,
      req.user.id,
      {
        scheduledAt: new Date(req.body.scheduledAt),
        mode: req.body.mode,
        location: req.body.location,
        meetingLink: req.body.meetingLink,
        notes: req.body.notes,
      },
      req.user.id
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getInterviews: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.getInterviews(req.user.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as 'upcoming' | 'completed' | 'all',
      courseId: req.query.courseId as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const completeInterview: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.completeInterview(
      req.params.id,
      req.user.id,
      {
        feedback: req.body.feedback,
        outcome: req.body.outcome,
      },
      req.user.id
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Profile ─────────────────────────────────────────────────────
export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.getProfile(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const uploadDocument: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.uploadDocument(req.user.id, {
      type: req.body.type,
      name: req.body.name,
      url: req.body.url,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteDocument: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.deleteDocument(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Analytics ───────────────────────────────────────────────────
export const getAnalytics: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await ngoService.getAnalytics(
      req.user.id,
      req.query.period as string
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Public Routes ────────────────────────────────────────────────
export const getPublicCourses: RequestHandler = async (req, res, next) => {
  try {
    const result = await ngoService.getPublicCourses({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 12,
      category: req.query.category as string,
      search: req.query.search as string,
      state: req.query.state as string,
      mode: req.query.mode as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getPublicCourseBySlug: RequestHandler = async (req, res, next) => {
  try {
    const result = await ngoService.getCourseBySlug(req.params.slug);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCourseFilters: RequestHandler = async (_req, res, next) => {
  try {
    const result = await ngoService.getCourseFilters();
    res.json(result);
  } catch (err) {
    next(err);
  }
};
