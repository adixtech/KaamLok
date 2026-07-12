// import { Router } from 'express';
// import * as ctrl from '../controllers/ngoController';

// const router = Router();

// /**
//  * Public Routes - No authentication required
//  * All routes under /api/public
//  */

// // ─── Courses ─────────────────────────────────────────────────────
// router.get('/courses', ctrl.getPublicCourses);
// router.get('/courses/:slug', ctrl.getPublicCourseBySlug);
// router.get('/courses/filters', ctrl.getCourseFilters);

// export default router;
//______________________________________________________________
import { Router } from 'express';
import * as ngoCtrl from '../controllers/ngoController';
import * as publicCtrl from '../controllers/publicController';

const router = Router();

/**
 * Public Routes - No authentication required
 * All routes under /api/public
 */

// ─── Courses ─────────────────────────────────────────────────────
router.get('/courses/filters', ngoCtrl.getCourseFilters);
router.get('/courses', ngoCtrl.getPublicCourses);
router.get('/courses/:slug', ngoCtrl.getPublicCourseBySlug);

// ─── Success Stories ────────────────────────────────────────────
router.get('/stories/featured', publicCtrl.getFeaturedStories);
router.get('/stories', publicCtrl.getAllStories);

// ─── Newsletter ──────────────────────────────────────────────────
router.post('/newsletter/subscribe', publicCtrl.subscribeNewsletter);
router.post('/newsletter/unsubscribe', publicCtrl.unsubscribeNewsletter);

// ─── NGO Public Profile ─────────────────────────────────────────
router.get('/ngos/featured', publicCtrl.getFeaturedNGOs);
router.get('/ngos/:slug', publicCtrl.getNGOProfileBySlug);

// ─── Contact ─────────────────────────────────────────────────────
router.post('/contact', publicCtrl.submitContact);

export default router;
