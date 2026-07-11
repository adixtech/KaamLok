import { Router } from 'express';
import * as ctrl from '../controllers/ngoController';

const router = Router();

/**
 * Public Routes - No authentication required
 * All routes under /api/public
 */

// ─── Courses ─────────────────────────────────────────────────────
router.get('/courses', ctrl.getPublicCourses);
router.get('/courses/:slug', ctrl.getPublicCourseBySlug);
router.get('/courses/filters', ctrl.getCourseFilters);

export default router;
