import { Router } from 'express';
import * as ctrl from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const student = [authenticate, authorize('student')];

// ─── Course Applications ─────────────────────────────────────────
router.post('/courses/:courseId/apply', ...student, ctrl.applyToCourse);
router.get('/courses/:courseId/application', ...student, ctrl.getApplicationStatus);
router.get('/applications', ...student, ctrl.getMyApplications);
router.patch('/applications/:applicationId/withdraw', ...student, ctrl.withdrawApplication);

// ─── Dashboard ───────────────────────────────────────────────────
router.get('/dashboard', ...student, ctrl.getDashboardStats);

// ─── Profile ─────────────────────────────────────────────────────
router.get('/profile', ...student, ctrl.getProfile);
router.patch('/profile', ...student, ctrl.updateProfile);

// ─── Saved Courses ────────────────────────────────────────────────
router.get('/saved-courses', ...student, ctrl.getSavedCourses);
router.post('/saved-courses/:courseId', ...student, ctrl.saveCourse);
router.delete('/saved-courses/:courseId', ...student, ctrl.unsaveCourse);

// ─── NGO Directory ────────────────────────────────────────────────
router.get('/ngos', ...student, ctrl.getNGODirectory);

// ─── Notifications ────────────────────────────────────────────────
router.get('/notifications', ...student, ctrl.getNotifications);
router.patch('/notifications/:id/read', ...student, ctrl.markNotificationRead);
router.patch('/notifications/mark-all-read', ...student, ctrl.markAllNotificationsRead);

export default router;
