import type { RequestHandler } from 'express';
import { publicService } from '../services/publicService';

/**
 * Public Controller - HTTP layer for public-facing routes
 */

// ─── Success Stories ────────────────────────────────────────────
export const getFeaturedStories: RequestHandler = async (_req, res, next) => {
  try {
    const result = await publicService.getFeaturedStories(6);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllStories: RequestHandler = async (req, res, next) => {
  try {
    const result = await publicService.getAllStories({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 12,
      search: req.query.search as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Newsletter ─────────────────────────────────────────────────
export const subscribeNewsletter: RequestHandler = async (req, res, next) => {
  try {
    const result = await publicService.subscribe(req.body.email);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const unsubscribeNewsletter: RequestHandler = async (req, res, next) => {
  try {
    const result = await publicService.unsubscribe(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── NGO Public Profile ──────────────────────────────────────────
export const getNGOProfileBySlug: RequestHandler = async (req, res, next) => {
  try {
    const result = await publicService.getNGOProfileBySlug(req.params.slug);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getFeaturedNGOs: RequestHandler = async (_req, res, next) => {
  try {
    const result = await publicService.getFeaturedNGOs(8);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ─── Contact ─────────────────────────────────────────────────────
export const submitContact: RequestHandler = async (req, res, next) => {
  try {
    const result = await publicService.submitContactMessage({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
