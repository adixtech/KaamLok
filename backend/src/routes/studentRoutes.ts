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
// Order matters: the static `mark-all-read` must be declared before the
// `:id` sibling would ever capture it (same method, one segment fewer).
router.get('/notifications', ...student, ctrl.getNotifications);
router.patch('/notifications/mark-all-read', ...student, ctrl.markAllNotificationsRead);
router.patch('/notifications/:id/read', ...student, ctrl.markNotificationRead);
router.delete('/notifications/:id', ...student, ctrl.deleteNotification);

// ─── Certificates ─────────────────────────────────────────────────
router.get('/certificates', ...student, ctrl.getCertificates);

// ─── Success Stories ──────────────────────────────────────────────
router.get('/success-stories', ...student, ctrl.getMySuccessStories);
router.post('/success-stories', ...student, ctrl.submitSuccessStory);

// ─── Timeline ─────────────────────────────────────────────────────
router.get('/timeline', ...student, ctrl.getTimeline);

// ─── Settings ─────────────────────────────────────────────────────
router.get('/settings', ...student, ctrl.getSettings);
router.put('/settings/notifications', ...student, ctrl.updateNotificationSettings);
router.put('/settings/preferences', ...student, ctrl.updatePreferences);

export default router;
