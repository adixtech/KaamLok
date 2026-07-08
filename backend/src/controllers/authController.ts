import type { RequestHandler } from 'express';
import { authService } from '../services/authService';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie';
import { ApiError } from '../utils/errors';

/**
 * Auth controller — thin HTTP layer that delegates to authService.
 */

export const registerStudent: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.registerStudent(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const registerNGO: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.registerNGO(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyOTP: RequestHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp);
    setAuthCookie(res, result.token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const resendOTP: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendOTP(email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setAuthCookie(res, result.token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    await authService.logout();
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    const result = await authService.getMe(req.user.id, req.user.role);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyResetOTP: RequestHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyResetOTP(email, otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
