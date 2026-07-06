import { Router } from 'express';
import * as ctrl from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  registerStudentValidators,
  registerNGOValidators,
  loginValidators,
  otpValidators,
  resendOTPValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
} from '../validators/authValidators';

const router = Router();

/**
 * Auth routes — all under /api/auth
 */
router.post('/register/student', registerStudentValidators, validate, ctrl.registerStudent);
router.post('/register/ngo', registerNGOValidators, validate, ctrl.registerNGO);
router.post('/verify-otp', otpValidators, validate, ctrl.verifyOTP);
router.post('/resend-otp', resendOTPValidators, validate, ctrl.resendOTP);
router.post('/login', loginValidators, validate, ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.getMe);
router.post('/forgot-password', forgotPasswordValidators, validate, ctrl.forgotPassword);
router.post('/verify-reset-otp', otpValidators, validate, ctrl.verifyResetOTP);
router.post('/reset-password', resetPasswordValidators, validate, ctrl.resetPassword);

export default router;
