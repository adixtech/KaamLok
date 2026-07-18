import type { RequestHandler } from 'express';
import { studentService } from '../services/studentService';
import { ApiError } from '../utils/errors';

const getUser = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
  return req.user;
};

// ─── Applications ────────────────────────────────────────────────
export const applyToCourse: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.applyToCourse(user.id, req.params.courseId, {
      message: req.body.message,
      documents: req.body.documents,
      resume: req.body.resume,
    });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

export const getApplicationStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.getApplicationStatus(user.id, req.params.courseId);
    res.json(result);
  } catch (err) { next(err); }
};

export const getMyApplications: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.getMyApplications(user.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
    });
    res.json(result);
  } catch (err) { next(err); }
};

export const withdrawApplication: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.withdrawApplication(user.id, req.params.applicationId);
    res.json(result);
  } catch (err) { next(err); }
};

// ─── Dashboard ───────────────────────────────────────────────────
export const getDashboardStats: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.getDashboardStats(user.id);
    res.json(result);
  } catch (err) { next(err); }
};

// ─── Profile ─────────────────────────────────────────────────────
export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.getProfile(user.id);
    res.json(result);
  } catch (err) { next(err); }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.updateProfile(user.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
};

// ─── Saved Courses ────────────────────────────────────────────────
export const getSavedCourses: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.getSavedCourses(user.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 12,
    });
    res.json(result);
  } catch (err) { next(err); }
};

export const saveCourse: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.saveCourse(user.id, req.params.courseId);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

export const unsaveCourse: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.unsaveCourse(user.id, req.params.courseId);
    res.json(result);
  } catch (err) { next(err); }
};

// ─── NGO Directory ────────────────────────────────────────────────
export const getNGODirectory: RequestHandler = async (req, res, next) => {
  try {
    getUser(req);
    const result = await studentService.getNGODirectory({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 12,
      search: req.query.search as string,
      state: req.query.state as string,
    });
    res.json(result);
  } catch (err) { next(err); }
};

// ─── Notifications ────────────────────────────────────────────────
export const getNotifications: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.getStudentNotifications(user.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json(result);
  } catch (err) { next(err); }
};

export const markNotificationRead: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.markNotificationRead(user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
};

export const markAllNotificationsRead: RequestHandler = async (req, res, next) => {
  try {
    const user = getUser(req);
    const result = await studentService.markAllNotificationsRead(user.id);
    res.json(result);
  } catch (err) { next(err); }
};
