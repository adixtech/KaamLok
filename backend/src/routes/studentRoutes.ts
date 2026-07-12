import { Router } from 'express';
import * as ctrl from '../controllers/studentController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Student Routes - For student course application actions
 * All routes under /api/student
 */

router.post('/courses/:courseId/apply', authenticate, ctrl.applyToCourse);
router.get('/courses/:courseId/application', authenticate, ctrl.getApplicationStatus);
router.get('/applications', authenticate, ctrl.getMyApplications);

export default router;
