import { body } from 'express-validator';

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Enter a valid email address')
  .normalizeEmail();

const phoneRule = body('phone')
  .trim()
  .matches(/^[6-9]\d{9}$/)
  .withMessage('Enter a valid 10-digit Indian mobile number');

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain an uppercase letter')
  .matches(/\d/)
  .withMessage('Password must contain a number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain a special character');

export const registerStudentValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  emailRule,
  phoneRule,
  passwordRule,
  body('education').trim().notEmpty().withMessage('Education is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
];

export const registerNGOValidators = [
  body('ngoName').trim().notEmpty().withMessage('NGO name is required'),
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  emailRule,
  phoneRule,
  body('website').optional().isURL().withMessage('Enter a valid website URL'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('description').isLength({ min: 30 }).withMessage('Description must be at least 30 characters'),
  passwordRule,
];

export const loginValidators = [
  emailRule,
  body('password').notEmpty().withMessage('Password is required'),
];

export const otpValidators = [
  emailRule,
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

export const resendOTPValidators = [emailRule];

export const forgotPasswordValidators = [emailRule];

export const resetPasswordValidators = [
  body('token').notEmpty().withMessage('Reset token is required'),
  passwordRule,
];
