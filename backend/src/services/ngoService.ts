import { Course, type ICourse, type CourseStatus } from '../models/Course';
import { Application, type IApplication, type ApplicationStatus } from '../models/Application';
import { NGOProfile, type INGOProfile } from '../models/NGOProfile';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Notification } from '../models/Notification';
import { ApiError } from '../utils/errors';
import type { Types } from 'mongoose';

/**
 * NGO Service - All business logic for NGO dashboard operations
 */

// Helper to generate unique slug
async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Course.findOne(query);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Helper to serialize course for frontend
function serializeCourse(course: ICourse) {
  return {
    _id: course._id.toString(),
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    category: course.category,
    industry: course.industry,
    tags: course.tags,
    language: course.language,
    difficulty: course.difficulty,
    thumbnail: course.thumbnail,
    banner: course.banner,
    mode: course.mode,
    onlineDetails: course.onlineDetails,
    offlineDetails: course.offlineDetails,
    schedule: {
      applicationStart: course.schedule.applicationStart.toISOString(),
      applicationEnd: course.schedule.applicationEnd.toISOString(),
      trainingStart: course.schedule.trainingStart.toISOString(),
      trainingEnd: course.schedule.trainingEnd.toISOString(),
      duration: course.schedule.duration,
      trainingDays: course.schedule.trainingDays,
      trainingTime: course.schedule.trainingTime,
    },
    eligibility: course.eligibility,
    benefits: course.benefits,
    recognition: course.recognition,
    placement: course.placement,
    totalSeats: course.totalSeats,
    waitingListEnabled: course.waitingListEnabled,
    maxWaitingStudents: course.maxWaitingStudents,
    filledSeats: course.filledSeats,
    availableSeats: course.availableSeats,
    contact: course.contact,
    ngoId: course.ngoId.toString(),
    ngoName: course.ngoName,
    ngoVerificationStatus: course.ngoVerificationStatus,
    ngoLogo: course.ngoLogo,
    status: course.status,
    isPublished: course.isPublished,
    publishedAt: course.publishedAt?.toISOString(),
    displayStatus: course.displayStatus,
    viewsCount: course.viewsCount,
    applicationsCount: course.applicationsCount,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

// Helper to serialize application for frontend
function serializeApplication(app: IApplication, student?: unknown, course?: unknown) {
  const obj = app.toObject();
  return {
    ...obj,
    _id: app._id.toString(),
    studentId: typeof student === 'object' ? student : app.studentId.toString(),
    courseId: typeof course === 'object' ? course : app.courseId.toString(),
    ngoId: app.ngoId.toString(),
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    interview: app.interview ? {
      ...app.interview,
      scheduledAt: app.interview.scheduledAt?.toISOString(),
      conductedBy: app.interview.conductedBy?.toString(),
    } : undefined,
    statusHistory: app.statusHistory.map(h => ({
      ...h,
      changedAt: h.changedAt.toISOString(),
      changedBy: h.changedBy?.toString(),
    })),
  };
}

export const ngoService = {
  // ─── Dashboard Stats ──────────────────────────────────────────
  async getDashboardStats(ngoId: string) {
    const [totalCourses, activeCourses, closedCourses, draftCourses] = await Promise.all([
      Course.countDocuments({ ngoId, status: { $ne: 'archived' } }),
      Course.countDocuments({ ngoId, status: 'published', isPublished: true }),
      Course.countDocuments({ ngoId, status: 'closed' }),
      Course.countDocuments({ ngoId, status: 'draft' }),
    ]);

    const [applicationsReceived, pendingReview, shortlisted, selected, rejected, waitlisted] = await Promise.all([
      Application.countDocuments({ ngoId }),
      Application.countDocuments({ ngoId, status: 'pending' }),
      Application.countDocuments({ ngoId, status: { $in: ['shortlisted', 'under_review'] } }),
      Application.countDocuments({ ngoId, status: 'selected' }),
      Application.countDocuments({ ngoId, status: 'rejected' }),
      Application.countDocuments({ ngoId, status: 'waitlisted' }),
    ]);

    // Seats analysis
    const courses = await Course.find({ ngoId, status: 'published' });
    const totalSeats = courses.reduce((sum, c) => sum + c.totalSeats, 0);
    const filledSeats = courses.reduce((sum, c) => sum + c.filledSeats, 0);

    // Applications trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const applicationsTrend = await Application.aggregate([
      { $match: { ngoId: new (await import('mongoose')).Types.ObjectId(ngoId), createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Recent applications
    const recentApplications = await Application.find({ ngoId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('studentId', 'firstName lastName email')
      .populate('courseId', 'title');

    // Upcoming deadlines
    const now = new Date();
    const upcomingDeadlines = await Course.find({
      ngoId,
      status: 'published',
      'schedule.applicationEnd': { $gte: now },
    })
      .sort({ 'schedule.applicationEnd': 1 })
      .limit(5)
      .select('title schedule.applicationEnd schedule.applicationStart totalSeats filledSeats');

    return {
      courses: { total: totalCourses, active: activeCourses, closed: closedCourses, draft: draftCourses },
      applications: {
        received: applicationsReceived,
        pending: pendingReview,
        shortlisted,
        selected,
        rejected,
        waitlisted,
      },
      seats: { total: totalSeats, filled: filledSeats, available: totalSeats - filledSeats },
      applicationsTrend,
      recentApplications: recentApplications.map(a => serializeApplication(a)),
      upcomingDeadlines: upcomingDeadlines.map(c => ({
        _id: c._id.toString(),
        title: c.title,
        applicationEnd: c.schedule.applicationEnd.toISOString(),
        daysLeft: Math.ceil((c.schedule.applicationEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        seatsAvailable: c.totalSeats - c.filledSeats,
      })),
    };
  },

  // ─── Course Management ──────────────────────────────────────────
  async createCourse(ngoId: string, data: Record<string, unknown>) {
    const ngoProfile = await NGOProfile.findOne({ user: ngoId });
    const user = await User.findById(ngoId);
    if (!user) throw new ApiError(404, 'NGO not found', 'NGO_NOT_FOUND');

    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new ApiError(400, 'Course title is required', 'VALIDATION_ERROR');
    }

    const slug = await generateUniqueSlug(data.title as string);

    const now = new Date();
    const farFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const schedule = (data.schedule as Record<string, unknown>) || {};
    const contact = (data.contact as Record<string, unknown>) || {};

    const courseData = {
      ...data,
      slug,
      ngoId,
      ngoName: ngoProfile?.ngoName || user.firstName,
      ngoVerificationStatus: user.verificationStatus || ngoProfile?.verificationStatus || 'pending',
      ngoLogo: ngoProfile?.logo,
      status: 'draft',
      isPublished: false,
      filledSeats: 0,
      schedule: {
        applicationStart: schedule.applicationStart || now.toISOString(),
        applicationEnd: schedule.applicationEnd || farFuture.toISOString(),
        trainingStart: schedule.trainingStart || farFuture.toISOString(),
        trainingEnd: schedule.trainingEnd || farFuture.toISOString(),
        duration: schedule.duration || '',
        trainingDays: schedule.trainingDays || [],
        trainingTime: schedule.trainingTime || { start: '09:00', end: '17:00' },
      },
      contact: {
        coordinatorName: contact.coordinatorName || '',
        coordinatorEmail: contact.coordinatorEmail || '',
        coordinatorPhone: contact.coordinatorPhone || '',
        alternativePhone: contact.alternativePhone || '',
        officeHours: contact.officeHours || '',
      },
    };

    const course = await Course.create(courseData);

    await NGOProfile.updateOne({ user: ngoId }, { $inc: { totalCourses: 1 } });

    return { course: serializeCourse(course), message: 'Course created successfully' };
  },

  async updateCourse(courseId: string, ngoId: string, data: Record<string, unknown>) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    if (course.isPublished && (data.schedule || data.totalSeats || data.eligibility)) {
      throw new ApiError(400, 'Cannot modify certain fields of a published course', 'COURSE_PUBLISHED');
    }

    if (data.title && data.title !== course.title) {
      course.slug = await generateUniqueSlug(data.title as string, courseId);
    }

    const nestedKeys = ['schedule', 'eligibility', 'placement', 'contact', 'onlineDetails', 'offlineDetails', 'trainingTime'];
    for (const [key, value] of Object.entries(data)) {
      if (nestedKeys.includes(key) && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existing = (course as any)[key] || {};
        (course as any)[key] = { ...existing, ...value };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (course as any)[key] = value;
      }
    }
    await course.save();

    return { course: serializeCourse(course), message: 'Course updated successfully' };
  },

  async getCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');
    return { course: serializeCourse(course) };
  },

  async getCourseBySlug(slug: string) {
    const course = await Course.findOne({ slug, isPublished: true })
      .populate('ngoId', 'firstName lastName email verificationStatus');
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    // Increment view count
    await Course.updateOne({ _id: course._id }, { $inc: { viewsCount: 1 } });

    return { course: serializeCourse(course) };
  },

  async listCourses(ngoId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CourseStatus;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 20, search, status, category, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { ngoId };
    if (status) query.status = status;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];

    const [courses, total] = await Promise.all([
      Course.find(query).sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 }).skip(skip).limit(limit),
      Course.countDocuments(query),
    ]);

    return {
      courses: courses.map(serializeCourse),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async publishCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    // Validate required fields
    if (!course.title || !course.description || !course.category || !course.mode) {
      throw new ApiError(400, 'Missing required fields for publishing', 'VALIDATION_ERROR');
    }
    if (!course.schedule.applicationStart || !course.schedule.applicationEnd || !course.schedule.trainingStart) {
      throw new ApiError(400, 'Schedule information is required', 'VALIDATION_ERROR');
    }
    if (!course.contact?.coordinatorName || !course.contact?.coordinatorEmail || !course.contact?.coordinatorPhone) {
      throw new ApiError(400, 'Coordinator contact information is required', 'VALIDATION_ERROR');
    }
    if (course.totalSeats < 1) {
      throw new ApiError(400, 'Total seats must be at least 1', 'VALIDATION_ERROR');
    }

    course.isPublished = true;
    course.status = 'published';
    course.publishedAt = new Date();
    await course.save();

    // Update NGO active courses
    await NGOProfile.updateOne({ user: ngoId }, { $inc: { activeCourses: 1 } });

    return { course: serializeCourse(course), message: 'Course published successfully' };
  },

  async pauseCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    course.status = 'paused';
    await course.save();

    return { message: 'Course paused successfully' };
  },

  async resumeCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    course.status = 'published';
    await course.save();

    return { message: 'Course resumed successfully' };
  },

  async closeCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    course.status = 'closed';
    await course.save();

    return { message: 'Course closed successfully' };
  },

  async archiveCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    course.status = 'archived';
    course.isPublished = false;
    await course.save();

    // Update NGO active courses
    await NGOProfile.updateOne({ user: ngoId }, { $inc: { activeCourses: -1, totalCourses: -1 } });

    return { message: 'Course archived successfully' };
  },

  async duplicateCourse(courseId: string, ngoId: string) {
    const original = await Course.findOne({ _id: courseId, ngoId });
    if (!original) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    const slug = await generateUniqueSlug(`${original.title} (Copy)`);
    const newCourse = await Course.create({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (Copy)`,
      slug,
      status: 'draft',
      isPublished: false,
      publishedAt: undefined,
      filledSeats: 0,
      viewsCount: 0,
      applicationsCount: 0,
    });

    // Update NGO stats
    await NGOProfile.updateOne({ user: ngoId }, { $inc: { totalCourses: 1 } });

    return { course: serializeCourse(newCourse), message: 'Course duplicated successfully' };
  },

  async deleteCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    if (course.filledSeats > 0) {
      throw new ApiError(400, 'Cannot delete course with enrolled students', 'COURSE_HAS_STUDENTS');
    }

    await Application.deleteMany({ courseId });
    await Course.deleteOne({ _id: courseId });

    // Update NGO stats
    await NGOProfile.updateOne({ user: ngoId }, { $inc: { totalCourses: -1 } });

    return { message: 'Course deleted successfully' };
  },

  // ─── Application Management ──────────────────────────────────────
  async listApplications(ngoId: string, params: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    courseId?: string;
    search?: string;
    sortBy?: string;
  }) {
    const { page = 1, limit = 20, status, courseId, search, sortBy = 'createdAt' } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { ngoId };
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;

    // If search, find matching students
    let studentIds: Types.ObjectId[] = [];
    if (search) {
      const students = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      studentIds = students.map(s => s._id);
      query.studentId = { $in: studentIds };
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort({ [sortBy]: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName email phone')
        .populate('courseId', 'title'),
      Application.countDocuments(query),
    ]);

    // Get student profiles for skills/education
    const studentIdList = applications.map(a => (a.studentId as unknown as { _id: Types.ObjectId })._id);
    const profiles = await StudentProfile.find({ user: { $in: studentIdList } });
    const profileMap = new Map(profiles.map(p => [p.user.toString(), p]));

    const serializedApplications = applications.map(a => {
      const student = a.studentId as unknown as { _id: string; firstName: string; lastName: string; email: string };
      const profile = profileMap.get(student._id);
      return {
        ...serializeApplication(a),
        studentProfile: profile ? {
          education: profile.education,
          city: profile.city,
          state: profile.state,
          skills: profile.skills,
        } : null,
      };
    });

    return {
      applications: serializedApplications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async getApplication(applicationId: string, ngoId: string) {
    const app = await Application.findOne({ _id: applicationId, ngoId })
      .populate('studentId')
      .populate('courseId');

    if (!app) throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND');

    // Get full student profile
    const student = app.studentId as unknown as { _id: Types.ObjectId };
    const profile = await StudentProfile.findOne({ user: student._id });

    return {
      application: {
        ...serializeApplication(app),
        studentProfile: profile,
      },
    };
  },

  async updateApplicationStatus(
    applicationId: string,
    ngoId: string,
    status: ApplicationStatus,
    note: string | undefined,
    changedBy: string
  ) {
    const app = await Application.findOne({ _id: applicationId, ngoId }).populate('courseId');
    if (!app) throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND');

    const previousStatus = app.status;
    app.$locals.changedBy = changedBy;
    app.$locals.statusNote = note;
    app.status = status;
    if (note) app.ngoNotes = note;

    await app.save();

    // If selected, update course seat count
    if (status === 'selected' && previousStatus !== 'selected') {
      const course = await Course.findById(app.courseId);
      if (course) {
        course.filledSeats += 1;
        await course.save();

        // Check if course is now full
        if (course.filledSeats >= course.totalSeats) {
          if (!course.waitingListEnabled) {
            course.status = 'closed';
            await course.save();
          }
        }

        // Update NGO stats
        await NGOProfile.updateOne({ user: ngoId }, { $inc: { studentsSelected: 1 } });
      }
    }

    // Send notification to student
    const studentId = app.studentId;
    await Notification.create({
      recipientId: studentId,
      type: 'application_received',
      title: 'Application Status Updated',
      message: `Your application status has been updated to: ${status}`,
      link: `/student/applications/${applicationId}`,
    });

    return { message: 'Application status updated' };
  },

  async shortlistApplication(applicationId: string, ngoId: string, changedBy: string, note?: string) {
    return this.updateApplicationStatus(applicationId, ngoId, 'shortlisted', note, changedBy);
  },

  async rejectApplication(applicationId: string, ngoId: string, changedBy: string, reason: string) {
    return this.updateApplicationStatus(applicationId, ngoId, 'rejected', reason, changedBy);
  },

  async selectApplication(applicationId: string, ngoId: string, changedBy: string, note?: string) {
    return this.updateApplicationStatus(applicationId, ngoId, 'selected', note, changedBy);
  },

  async waitlistApplication(applicationId: string, ngoId: string, changedBy: string, note?: string) {
    return this.updateApplicationStatus(applicationId, ngoId, 'waitlisted', note, changedBy);
  },

  // ─── Interview Management ──────────────────────────────────────
  async scheduleInterview(
    applicationId: string,
    ngoId: string,
    data: {
      scheduledAt: Date;
      mode: 'online' | 'offline' | 'phone';
      location?: string;
      meetingLink?: string;
      notes?: string;
    },
    changedBy: string
  ) {
    const app = await Application.findOne({ _id: applicationId, ngoId });
    if (!app) throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND');

    app.interview = {
      ...data,
      completed: false,
    };
    app.$locals.changedBy = changedBy;
    app.$locals.statusNote = 'Interview scheduled';
    app.status = 'interview_scheduled';
    await app.save();

    // Notify student
    await Notification.create({
      recipientId: app.studentId,
      type: 'system',
      title: 'Interview Scheduled',
      message: `Your interview has been scheduled for ${new Date(data.scheduledAt).toLocaleString()}`,
      link: `/student/applications/${applicationId}`,
    });

    return { message: 'Interview scheduled successfully' };
  },

  async getInterviews(ngoId: string, params: {
    page?: number;
    limit?: number;
    status?: 'upcoming' | 'completed' | 'all';
    courseId?: string;
  }) {
    const { page = 1, limit = 20, status = 'upcoming', courseId } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      ngoId,
      status: 'interview_scheduled',
      'interview.scheduledAt': { $exists: true },
    };

    if (courseId) query.courseId = courseId;

    if (status === 'upcoming') {
      query['interview.completed'] = { $ne: true };
      query['interview.scheduledAt'] = { $gte: new Date() };
    } else if (status === 'completed') {
      query['interview.completed'] = true;
    }

    const [interviews, total] = await Promise.all([
      Application.find(query)
        .sort({ 'interview.scheduledAt': 1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName email phone')
        .populate('courseId', 'title'),
      Application.countDocuments(query),
    ]);

    return {
      interviews: interviews.map(serializeApplication),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async completeInterview(
    applicationId: string,
    ngoId: string,
    data: { feedback?: string; outcome: 'selected' | 'rejected' },
    changedBy: string
  ) {
    const app = await Application.findOne({ _id: applicationId, ngoId });
    if (!app) throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND');

    app.interview = {
      ...app.interview!,
      completed: true,
      feedback: data.feedback,
    };

    // Update status based on outcome
    return this.updateApplicationStatus(applicationId, ngoId, data.outcome, data.feedback, changedBy);
  },

  // ─── Organization Profile ──────────────────────────────────────
  async getProfile(ngoId: string) {
    const profile = await NGOProfile.findOne({ user: ngoId }).populate('user');
    if (!profile) throw new ApiError(404, 'NGO profile not found', 'PROFILE_NOT_FOUND');

    // Calculate profile completion
    const completion = profile.calculateProfileCompletion();
    if (completion !== profile.profileCompletion) {
      profile.profileCompletion = completion;
      await profile.save();
    }

    return { profile };
  },

  async updateProfile(ngoId: string, data: Record<string, unknown>) {
    const profile = await NGOProfile.findOne({ user: ngoId });
    if (!profile) throw new ApiError(404, 'NGO profile not found', 'PROFILE_NOT_FOUND');

    if (data.ngoName && data.ngoName !== profile.ngoName) {
      const slug = (data.ngoName as string)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      data.slug = slug;
    }

    const nestedKeys = ['socialLinks'];
    for (const [key, value] of Object.entries(data)) {
      if (nestedKeys.includes(key) && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (profile as any)[key] = { ...(profile as any)[key]?.toObject?.() || (profile as any)[key] || {}, ...value };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (profile as any)[key] = value;
      }
    }
    profile.profileCompletion = profile.calculateProfileCompletion();
    await profile.save();

    return { profile, message: 'Profile updated successfully' };
  },

  async uploadDocument(ngoId: string, data: {
    type: 'registration' | '80g' | '12a' | 'csr' | 'government_approval' | 'other';
    name: string;
    url: string;
  }) {
    const profile = await NGOProfile.findOne({ user: ngoId });
    if (!profile) throw new ApiError(404, 'NGO profile not found', 'PROFILE_NOT_FOUND');

    profile.documents.push({
      ...data,
      status: 'pending',
      uploadedAt: new Date(),
    });
    await profile.save();

    return { message: 'Document uploaded successfully' };
  },

  async deleteDocument(ngoId: string, documentId: string) {
    const profile = await NGOProfile.findOne({ user: ngoId });
    if (!profile) throw new ApiError(404, 'NGO profile not found', 'PROFILE_NOT_FOUND');

    profile.documents = profile.documents.filter(d => d._id?.toString() !== documentId);
    await profile.save();

    return { message: 'Document deleted' };
  },

  // ─── Reports Analytics ──────────────────────────────────────
  async getAnalytics(ngoId: string, period: string = 'monthly') {
    const now = new Date();
    let startDate: Date;
    let groupBy: Record<string, unknown>;

    if (period === 'daily') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    } else if (period === 'weekly') {
      startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
      groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear() - 2, 0, 1);
      groupBy = { year: { $year: '$createdAt' } };
    } else {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    }

    const [applicationsGrowth, courseStats, statusDistribution] = await Promise.all([
      Application.aggregate([
        { $match: { ngoId: new (await import('mongoose')).Types.ObjectId(ngoId), createdAt: { $gte: startDate } } },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Course.aggregate([
        { $match: { ngoId: new (await import('mongoose')).Types.ObjectId(ngoId) } },
        { $group: { _id: '$status', count: { $sum: 1 }, totalSeats: { $sum: '$totalSeats' }, filled: { $sum: '$filledSeats' } } },
      ]),
      Application.aggregate([
        { $match: { ngoId: new (await import('mongoose')).Types.ObjectId(ngoId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      period,
      applicationsGrowth,
      courseStats,
      statusDistribution,
    };
  },

  // ─── Public Course Listing ──────────────────────────────────────
  async getPublicCourses(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    state?: string;
    mode?: string;
  }) {
    const { page = 1, limit = 12, category, search, state, mode } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      isPublished: true,
      status: 'published',
      'schedule.applicationEnd': { $gte: new Date() },
    };

    if (category) query.category = { $regex: category, $options: 'i' };
    if (mode) query.mode = mode;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Filter by location (state)
    if (state) query['offlineDetails.state'] = { $regex: state, $options: 'i' };

    const [courses, total] = await Promise.all([
      Course.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Course.countDocuments(query),
    ]);

    return {
      courses: courses.map(c => ({
        _id: c._id.toString(),
        title: c.title,
        slug: c.slug,
        shortDescription: c.shortDescription,
        category: c.category,
        difficulty: c.difficulty,
        mode: c.mode,
        banner: c.banner,
        thumbnail: c.thumbnail,
        ngoId: c.ngoId.toString(),
        ngoName: c.ngoName,
        ngoVerificationStatus: c.ngoVerificationStatus,
        ngoLogo: c.ngoLogo,
        displayStatus: c.displayStatus,
        totalSeats: c.totalSeats,
        filledSeats: c.filledSeats,
        availableSeats: c.availableSeats,
        schedule: {
          applicationEnd: c.schedule.applicationEnd.toISOString(),
          trainingStart: c.schedule.trainingStart.toISOString(),
          duration: c.schedule.duration,
        },
        benefits: c.benefits,
        recognition: c.recognition,
        applicationsCount: c.applicationsCount,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async getCourseFilters() {
    const courses = await Course.find({
      isPublished: true,
      status: 'published',
      'schedule.applicationEnd': { $gte: new Date() },
    });

    // Extract unique categories with counts
    const categoryMap = new Map<string, number>();
    const skillMap = new Map<string, number>();
    const stateMap = new Map<string, number>();

    courses.forEach(c => {
      // Categories
      const cat = c.category;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);

      // Skills from tags
      c.tags.forEach(t => {
        skillMap.set(t, (skillMap.get(t) || 0) + 1);
      });

      // States
      if (c.offlineDetails?.state) {
        stateMap.set(c.offlineDetails.state, (stateMap.get(c.offlineDetails.state) || 0) + 1);
      }
    });

    const categories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const skills = Array.from(skillMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const states = Array.from(stateMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { categories, skills, states };
  },
};
