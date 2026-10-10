import { SuccessStory, type ISuccessStory } from '../models/SuccessStory';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber';
import { ContactMessage } from '../models/ContactMessage';
import { NGOProfile, type INGOProfile } from '../models/NGOProfile';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { ApiError } from '../utils/errors';

/**
 * Canonical "verified + active" NGO user IDs.
 * An NGO is publicly visible only when:
 *   NGOProfile.verificationStatus === 'approved'
 *   AND the associated User.status === 'active' (not blocked/pending)
 * Callers must always use this to build the base filter.
 */
async function getVisibleNGOUserIds(): Promise<string[]> {
  const activeUsers = await User.find({ role: 'ngo', status: 'active' })
    .select('_id')
    .lean();
  return activeUsers.map((u) => u._id.toString());
}

/**
 * Build the base query for publicly-visible NGO profiles.
 * Ensures a single source of truth across directory, count, and featured endpoints.
 */
async function buildVisibleNGOQuery(): Promise<Record<string, unknown>> {
  const userIds = await getVisibleNGOUserIds();
  return {
    verificationStatus: 'approved',
    user: { $in: userIds },
  };
}

/**
 * Public Service - Business logic for public-facing routes
 * (success stories, newsletter, NGO public profiles, contact messages)
 */

function serializeStory(s: ISuccessStory) {
  return {
    _id: s._id.toString(),
    studentName: s.studentName,
    studentPhoto: s.studentPhoto,
    studentAge: s.studentAge,
    studentCity: s.studentCity,
    ngoId: s.ngoId.toString(),
    ngoName: s.ngoName,
    ngoLogo: s.ngoLogo,
    courseId: s.courseId.toString(),
    courseTitle: s.courseTitle,
    skillsLearned: s.skillsLearned,
    currentRole: s.currentRole,
    currentCompany: s.currentCompany,
    currentSalary: s.currentSalary,
    beforeStory: s.beforeStory,
    afterStory: s.afterStory,
    quote: s.quote,
    completionDate: s.completionDate.toISOString(),
    isFeatured: s.isFeatured,
    createdAt: s.createdAt.toISOString(),
  };
}

function serializeNGOProfile(p: INGOProfile, courseCount: number, activeCount: number) {
  return {
    _id: p._id.toString(),
    user: p.user.toString(),
    ngoName: p.ngoName,
    slug: p.slug,
    registrationNumber: p.registrationNumber,
    logo: p.logo,
    coverImage: p.coverImage,
    description: p.description,
    mission: p.mission,
    vision: p.vision,
    email: p.email,
    phone: p.phone,
    alternativePhone: p.alternativePhone,
    address: p.address,
    city: p.city,
    state: p.state,
    pin: p.pin,
    establishedYear: p.establishedYear,
    yearsOfExperience: p.yearsOfExperience,
    studentsTrained: p.studentsTrained,
    sectorsFocused: p.sectorsFocused,
    socialLinks: p.socialLinks,
    verificationStatus: p.verificationStatus,
    totalCourses: courseCount,
    activeCourses: activeCount,
    createdAt: p.createdAt.toISOString(),
  };
}

export const publicService = {
  // ─── Success Stories ──────────────────────────────────────────
  async getFeaturedStories(limit = 6) {
    const stories = await SuccessStory.find({ isPublished: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    return { stories: stories.map(serializeStory) };
  },

  async getAllStories(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 12, search } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { isPublished: true };
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } },
        { ngoName: { $regex: search, $options: 'i' } },
        { currentRole: { $regex: search, $options: 'i' } },
      ];
    }

    const [stories, total] = await Promise.all([
      SuccessStory.find(query).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(limit),
      SuccessStory.countDocuments(query),
    ]);

    return {
      stories: stories.map(serializeStory),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  // ─── Newsletter ───────────────────────────────────────────────
  async subscribe(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new ApiError(400, 'Please enter a valid email address', 'INVALID_EMAIL');
    }

    const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.isActive) {
        throw new ApiError(409, 'You are already subscribed to our newsletter!', 'ALREADY_SUBSCRIBED');
      }
      existing.isActive = true;
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = undefined;
      await existing.save();
      return { message: 'Welcome back! You have been re-subscribed to our newsletter.' };
    }

    await NewsletterSubscriber.create({ email: normalizedEmail });
    return { message: 'Successfully subscribed to the KaamLok newsletter!' };
  },

  async unsubscribe(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });
    if (!subscriber || !subscriber.isActive) {
      throw new ApiError(404, 'Email not found in our subscriber list', 'NOT_FOUND');
    }
    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
    return { message: 'You have been unsubscribed from the newsletter.' };
  },

  // ─── NGO Public Profile ───────────────────────────────────────
  async getNGOProfileBySlug(slugOrId: string) {
    const baseQuery = await buildVisibleNGOQuery();
    let profile = await NGOProfile.findOne({ ...baseQuery, slug: slugOrId });
    if (!profile) {
      const { isValidObjectId } = await import('mongoose');
      if (isValidObjectId(slugOrId)) {
        profile = await NGOProfile.findOne({ ...baseQuery, user: slugOrId });
      }
    }
    if (!profile) throw new ApiError(404, 'NGO not found', 'NGO_NOT_FOUND');

    const [totalCourses, activeCourses, publishedCourses] = await Promise.all([
      Course.countDocuments({ ngoId: profile.user, status: { $ne: 'archived' } }),
      Course.countDocuments({ ngoId: profile.user, status: 'published', isPublished: true }),
      Course.find({
        ngoId: profile.user,
        status: 'published',
        isPublished: true,
        'schedule.applicationEnd': { $gte: new Date() },
      })
        .sort({ publishedAt: -1 })
        .select('title slug shortDescription category mode thumbnail schedule.totalSeats schedule.filledSeats schedule.applicationEnd schedule.duration displayStatus totalSeats filledSeats availableSeats'),
    ]);

    const courses = publishedCourses.map((c) => ({
      _id: c._id.toString(),
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
      category: c.category,
      mode: c.mode,
      thumbnail: c.thumbnail,
      displayStatus: c.displayStatus,
      totalSeats: c.totalSeats,
      filledSeats: c.filledSeats,
      availableSeats: c.availableSeats,
      schedule: {
        applicationEnd: c.schedule.applicationEnd.toISOString(),
        duration: c.schedule.duration,
      },
    }));

    return {
      profile: serializeNGOProfile(profile, totalCourses, activeCourses),
      courses,
    };
  },

  async getFeaturedNGOs(limit = 8) {
    const baseQuery = await buildVisibleNGOQuery();
    const profiles = await NGOProfile.find(baseQuery)
      .sort({ studentsTrained: -1, createdAt: -1 })
      .limit(limit)
      .select('user ngoName slug logo description city state studentsTrained sectorsFocused establishedYear socialLinks');

    const profilesWithCounts = await Promise.all(
      profiles.map(async (p) => {
        const activeCourses = await Course.countDocuments({
          ngoId: p.user,
          status: 'published',
          isPublished: true,
        });
        return {
          _id: p._id.toString(),
          ngoName: p.ngoName,
          slug: p.slug,
          logo: p.logo,
          description: p.description,
          city: p.city,
          state: p.state,
          studentsTrained: p.studentsTrained,
          sectorsFocused: p.sectorsFocused,
          establishedYear: p.establishedYear,
          activeCourses,
        };
      })
    );

    return { ngos: profilesWithCounts };
  },

  // ─── Verified NGO Directory ────────────────────────────────────
  async getVerifiedNGOs(params: {
    page?: number;
    limit?: number;
    search?: string;
    state?: string;
    sector?: string;
  }) {
    const { page = 1, limit = 12, search, state, sector } = params;
    const skip = (page - 1) * limit;

    const query = await buildVisibleNGOQuery();
    if (state) query.state = { $regex: state, $options: 'i' };
    if (sector) query.sectorsFocused = { $in: [new RegExp(sector, 'i')] };
    if (search) {
      query.$or = [
        { ngoName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sectorsFocused: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [ngos, total] = await Promise.all([
      NGOProfile.find(query)
        .sort({ studentsTrained: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        // `user` is required: the per-NGO active-course count below filters on
        // it. Without it the filter becomes { ngoId: undefined }, which matches
        // every published course platform-wide.
        .select('user ngoName slug logo coverImage description city state studentsTrained sectorsFocused establishedYear socialLinks'),
      NGOProfile.countDocuments(query),
    ]);

    const ngosWithCounts = await Promise.all(
      ngos.map(async (n) => {
        const activeCourses = await Course.countDocuments({
          ngoId: n.user,
          status: 'published',
          isPublished: true,
        });
        return {
          _id: n._id.toString(),
          ngoName: n.ngoName,
          slug: n.slug,
          logo: n.logo,
          coverImage: n.coverImage,
          description: n.description,
          city: n.city,
          state: n.state,
          studentsTrained: n.studentsTrained || 0,
          sectorsFocused: n.sectorsFocused || [],
          establishedYear: n.establishedYear,
          activeCourses,
        };
      })
    );

    return {
      ngos: ngosWithCounts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async getVerifiedNGOCount() {
    const baseQuery = await buildVisibleNGOQuery();
    const total = await NGOProfile.countDocuments(baseQuery);
    const states = await NGOProfile.distinct('state', {
      ...baseQuery,
      state: { $nin: [null, '', undefined] },
    });
    const sectors = await NGOProfile.distinct('sectorsFocused', {
      ...baseQuery,
      sectorsFocused: { $nin: [null, '', undefined] },
    });
    return { total, states: states.filter(Boolean), sectors: sectors.filter(Boolean) };
  },

  // ─── Contact Messages ─────────────────────────────────────────
  async submitContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ApiError(400, 'Please enter a valid email address', 'INVALID_EMAIL');
    }
    if (!data.name?.trim() || !data.subject?.trim() || !data.message?.trim()) {
      throw new ApiError(400, 'All fields are required', 'VALIDATION_ERROR');
    }
    if (data.message.length > 5000) {
      throw new ApiError(400, 'Message must be less than 5000 characters', 'VALIDATION_ERROR');
    }

    await ContactMessage.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
    });

    return { message: 'Your message has been sent. We will get back to you within 48 hours.' };
  },
};
