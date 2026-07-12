import type { RequestHandler } from 'express';
import { studentService } from '../services/studentService';
import { ApiError } from '../utils/errors';

/**
 * Student Controller - HTTP layer for student course actions
 */

export const applyToCourse: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await studentService.applyToCourse(req.user.id, req.params.courseId, {
      message: req.body.message,
      documents: req.body.documents,
      resume: req.body.resume,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getApplicationStatus: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await studentService.getApplicationStatus(req.user.id, req.params.courseId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMyApplications: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await studentService.getMyApplications(req.user.id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
