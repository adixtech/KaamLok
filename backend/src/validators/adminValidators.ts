import { body } from 'express-validator';

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Enter a valid email address')
  .normalizeEmail();

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain an uppercase letter')
  .matches(/\d/)
  .withMessage('Password must contain a number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain a special character');

export const createAdminValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  emailRule,
  passwordRule,
  body('adminRole')
    .isIn(['super_admin', 'operations_admin', 'verification_admin', 'support_admin', 'analytics_admin', 'content_admin', 'csr_admin'])
    .withMessage('Invalid admin role'),
];

export const updateAdminValidators = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('adminRole')
    .optional()
    .isIn(['super_admin', 'operations_admin', 'verification_admin', 'support_admin', 'analytics_admin', 'content_admin', 'csr_admin'])
    .withMessage('Invalid admin role'),
];

export const resetAdminPasswordValidators = [passwordRule];

export const suspendAdminValidators = [body('reason').optional().trim()];
