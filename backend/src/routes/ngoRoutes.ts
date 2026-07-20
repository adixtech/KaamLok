import { Router } from 'express';
import * as ctrl from '../controllers/ngoController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * NGO Routes - All routes under /api/ngo
 * Authentication required for all NGO routes
 */

// All routes require authentication and NGO role
router.use(authenticate);
router.use(authorize('ngo'));

// ─── Dashboard ──────────────────────────────────────────────────
router.get('/dashboard/stats', ctrl.getDashboardStats);

// ─── Courses ─────────────────────────────────────────────────────
router.get('/courses', ctrl.listCourses);
router.get('/courses/:id', ctrl.getCourse);
router.post('/courses', ctrl.createCourse);
router.put('/courses/:id', ctrl.updateCourse);
router.post('/courses/:id/publish', ctrl.publishCourse);
router.post('/courses/:id/pause', ctrl.pauseCourse);
router.post('/courses/:id/resume', ctrl.resumeCourse);
router.post('/courses/:id/close', ctrl.closeCourse);
router.post('/courses/:id/archive', ctrl.archiveCourse);
router.post('/courses/:id/duplicate', ctrl.duplicateCourse);
router.delete('/courses/:id', ctrl.deleteCourse);

// ─── Applications ────────────────────────────────────────────────
router.get('/applications', ctrl.listApplications);
router.get('/applications/:id', ctrl.getApplication);
router.get('/applications/:id/student', ctrl.getStudentProfile);
router.post('/applications/:id/review', ctrl.startReviewApplication);
router.post('/applications/:id/shortlist', ctrl.shortlistApplication);
router.post('/applications/:id/reject', ctrl.rejectApplication);
router.post('/applications/:id/select', ctrl.selectApplication);
router.post('/applications/:id/waitlist', ctrl.waitlistApplication);

// ─── Interviews ──────────────────────────────────────────────────
router.get('/interviews', ctrl.getInterviews);
router.post('/interviews/:id/schedule', ctrl.scheduleInterview);
router.post('/interviews/:id/complete', ctrl.completeInterview);

// ─── Profile ─────────────────────────────────────────────────────
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.post('/documents', ctrl.uploadDocument);
router.delete('/documents/:id', ctrl.deleteDocument);

// ─── Analytics ───────────────────────────────────────────────────
router.get('/analytics', ctrl.getAnalytics);

// ─── Notifications ──────────────────────────────────────────────
router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/:id/read', ctrl.markNotificationRead);
router.put('/notifications/read-all', ctrl.markAllNotificationsRead);
router.delete('/notifications/:id', ctrl.deleteNotification);

export default router;
