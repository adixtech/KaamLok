import { Course, type ICourse, type CourseStatus } from '../models/Course';
import { Application, type IApplication, type ApplicationStatus } from '../models/Application';
import { NGOProfile, type INGOProfile } from '../models/NGOProfile';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Notification } from '../models/Notification';
import { SuccessStory } from '../models/SuccessStory';
import { ApiError } from '../utils/errors';
import { normalizeCourseLists } from '../utils/normalize';
import { sendTransactionalEmail } from './emailService';
import { config } from '../config/env';
import type { Types } from 'mongoose';

type NGOProfileWithSettings = INGOProfile & {
  notificationSettings?: Record<string, boolean>;
  preferences?: Record<string, string>;
};

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
    const now = new Date();
    const [totalCourses, activeCourses, closedCourses, draftCourses] = await Promise.all([
      Course.countDocuments({ ngoId, status: { $ne: 'archived' } }),
      // A "live" course accepts applications, so an expired applicationEnd no
      // longer counts toward active courses (previously expired courses were
      // still shown as active).
      Course.countDocuments({ ngoId, status: 'published', isPublished: true, 'schedule.applicationEnd': { $gte: now } }),
      Course.countDocuments({ ngoId, status: 'closed' }),
      Course.countDocuments({ ngoId, status: 'draft' }),
    ]);

    const [
      applicationsReceived,
      pendingReview,
      underReview,
      shortlisted,
      interviewScheduled,
      selected,
      rejected,
      waitlisted,
    ] = await Promise.all([
      Application.countDocuments({ ngoId }),
      Application.countDocuments({ ngoId, status: 'pending' }),
      Application.countDocuments({ ngoId, status: 'under_review' }),
      Application.countDocuments({ ngoId, status: 'shortlisted' }),
      Application.countDocuments({ ngoId, status: 'interview_scheduled' }),
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
        underReview,
        shortlisted,
        interviewScheduled,
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
  async createCourse(ngoId: string, rawData: Record<string, unknown>) {
    const ngoProfile = await NGOProfile.findOne({ user: ngoId });
    const user = await User.findById(ngoId);
    if (!user) throw new ApiError(404, 'NGO not found', 'NGO_NOT_FOUND');

    if (!rawData.title || typeof rawData.title !== 'string' || !rawData.title.trim()) {
      throw new ApiError(400, 'Course title is required', 'VALIDATION_ERROR');
    }

    // Comma-separated list fields arrive as strings from the course editor.
    const data = normalizeCourseLists(rawData);
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

  async updateCourse(courseId: string, ngoId: string, rawData: Record<string, unknown>) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    if (course.isPublished && (rawData.schedule || rawData.totalSeats || rawData.eligibility)) {
      throw new ApiError(400, 'Cannot modify certain fields of a published course', 'COURSE_PUBLISHED');
    }

    const data = normalizeCourseLists(rawData);

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

    const previousStatus = course.status;
    course.status = 'paused';
    await course.save();

    if (previousStatus === 'published') {
      await NGOProfile.updateOne({ user: ngoId }, { $inc: { activeCourses: -1 } });
    }

    return { message: 'Course paused successfully' };
  },

  async resumeCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    const previousStatus = course.status;
    course.status = 'published';
    await course.save();

    if (previousStatus !== 'published') {
      await NGOProfile.updateOne({ user: ngoId }, { $inc: { activeCourses: 1 } });
    }

    return { message: 'Course resumed successfully' };
  },

  async closeCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    const previousStatus = course.status;
    course.status = 'closed';
    await course.save();

    if (previousStatus === 'published') {
      await NGOProfile.updateOne({ user: ngoId }, { $inc: { activeCourses: -1 } });
    }

    return { message: 'Course closed successfully' };
  },

  async archiveCourse(courseId: string, ngoId: string) {
    const course = await Course.findOne({ _id: courseId, ngoId });
    if (!course) throw new ApiError(404, 'Course not found', 'COURSE_NOT_FOUND');

    const previousStatus = course.status;
    course.status = 'archived';
    course.isPublished = false;
    await course.save();

    const update: Record<string, number> = { totalCourses: -1 };
    if (previousStatus === 'published') {
      update.activeCourses = -1;
    }
    await NGOProfile.updateOne({ user: ngoId }, { $inc: update });

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

    const update: Record<string, number> = { totalCourses: -1 };
    if (course.status === 'published') {
      update.activeCourses = -1;
    }
    await NGOProfile.updateOne({ user: ngoId }, { $inc: update });

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

  async getStudentProfile(applicationId: string, ngoId: string) {
    // NGO can view a student's full profile only if they have an application
    // with this NGO. This prevents unauthorized profile access.
    const app = await Application.findOne({ _id: applicationId, ngoId });
    if (!app) throw new ApiError(404, 'Application not found', 'APPLICATION_NOT_FOUND');

    const [user, profile, course] = await Promise.all([
      User.findById(app.studentId).select(
        'firstName lastName email phone role status createdAt'
      ),
      StudentProfile.findOne({ user: app.studentId }),
      Course.findById(app.courseId).select('title slug category mode ngoName'),
    ]);

    if (!user) throw new ApiError(404, 'Student not found', 'NOT_FOUND');

    return {
      user: {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      profile: profile
        ? {
            _id: profile._id.toString(),
            education: profile.education,
            city: profile.city,
            state: profile.state,
            skills: profile.skills,
            dateOfBirth: profile.dateOfBirth?.toISOString(),
            gender: profile.gender,
            phone: profile.phone,
            alternativePhone: profile.alternativePhone,
            address: profile.address,
            pin: profile.pin,
            photo: profile.photo,
            bio: profile.bio,
            educationDetails: profile.educationDetails,
            experience: profile.experience,
            languages: profile.languages,
            emergencyContact: profile.emergencyContact,
            resume: profile.resume,
            portfolio: profile.portfolio,
            socialLinks: profile.socialLinks,
            profileCompletionScore: profile.profileCompletionScore,
          }
        : null,
      application: {
        _id: app._id.toString(),
        status: app.status,
        message: app.message,
        documents: app.documents,
        resume: app.resume,
        createdAt: app.createdAt.toISOString(),
        statusHistory: app.statusHistory.map((h) => ({
          status: h.status,
          changedAt: h.changedAt.toISOString(),
          note: h.note,
        })),
      },
      course: course
        ? {
            _id: course._id.toString(),
            title: course.title,
            slug: course.slug,
            category: course.category,
            mode: course.mode,
            ngoName: course.ngoName,
          }
        : null,
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

    // Seat management: handle transitions to/from 'selected'
    const wasSelected = previousStatus === 'selected';
    const isSelected = status === 'selected';

    if (isSelected && !wasSelected) {
      // Moving TO selected — reserve a seat
      const course = await Course.findById(app.courseId);
      if (course) {
        if (course.filledSeats < course.totalSeats) {
          course.filledSeats += 1;
        }
        // Auto-close course when full and waitlist disabled
        if (course.filledSeats >= course.totalSeats && !course.waitingListEnabled) {
          course.status = 'closed';
        }
        await course.save();
        await NGOProfile.updateOne({ user: ngoId }, { $inc: { studentsSelected: 1 } });
      }
    } else if (wasSelected && !isSelected) {
      // Moving AWAY from selected — release the seat
      const course = await Course.findById(app.courseId);
      if (course) {
        if (course.filledSeats > 0) {
          course.filledSeats -= 1;
        }
        // Reopen course if it was auto-closed due to full seats
        if (course.status === 'closed' && course.filledSeats < course.totalSeats) {
          course.status = 'published';
        }
        await course.save();
        await NGOProfile.updateOne({ user: ngoId }, { $inc: { studentsSelected: -1 } });
      }
    }

    // Send notification to student
    const studentId = app.studentId;
    const course = app.courseId as unknown as { title?: string };
    const courseTitle = course?.title || 'your course';
    const statusLabels: Record<string, string> = {
      pending: 'Received',
      under_review: 'Under Review',
      shortlisted: 'Shortlisted',
      interview_scheduled: 'Interview Scheduled',
      selected: 'Selected',
      rejected: 'Not Selected',
      waitlisted: 'Waitlisted',
      withdrawn: 'Withdrawn',
    };
    const statusLabel = statusLabels[status] || status;
    await Notification.create({
      recipientId: studentId,
      type: 'application_received',
      title: 'Application Status Updated',
      message: `Your application for "${courseTitle}" has been updated to: ${statusLabel}`,
      link: `/student/applications`,
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

  /**
   * Deliver a message from an NGO to a student.
   *
   * Two channels, so the student is not dependent on either:
   *   1. an in-app Notification (appears in the student's Messages/Notifications)
   *   2. a real email via the configured transport (SMTP / SES / SNS)
   *
   * If `applicationId` is supplied the recipient must be an applicant to this
   * NGO, which keeps an NGO from reaching arbitrary students.
   */
  async sendStudentMessage(
    ngoId: string,
    input: { recipientEmail: string; subject: string; body: string; applicationId?: string }
  ) {
    const email = input.recipientEmail.trim().toLowerCase();
    const subject = input.subject.trim();
    const body = input.body.trim();

    if (!email) throw new ApiError(400, 'Recipient email is required', 'VALIDATION_ERROR', 'recipientEmail');
    if (!subject) throw new ApiError(400, 'Subject is required', 'VALIDATION_ERROR', 'subject');
    if (!body) throw new ApiError(400, 'Message body is required', 'VALIDATION_ERROR', 'body');

    const student = await User.findOne({ email, role: 'student' });
    if (!student) throw new ApiError(404, 'No student found with that email', 'RECIPIENT_NOT_FOUND');

    let applicationId: string | undefined = input.applicationId;
    if (applicationId) {
      const owned = await Application.findOne({ _id: applicationId, ngoId, studentId: student._id })
        .select('_id');
      if (!owned) {
        throw new ApiError(403, 'You can only message students who applied to your organization', 'FORBIDDEN');
      }
    } else {
      // No explicit scope: only message students who applied to this NGO.
      const related = await Application.findOne({ ngoId, studentId: student._id }).select('_id');
      if (!related) {
        throw new ApiError(403, 'You can only message students who applied to your organization', 'FORBIDDEN');
      }
      applicationId = related._id.toString();
    }

    const sender = await NGOProfile.findOne({ user: ngoId }).select('ngoName');
    const senderName = sender?.ngoName || 'Your NGO';

    const notification = await Notification.create({
      recipientId: student._id,
      type: 'system',
      title: subject,
      message: body,
      link: applicationId ? `/student/applications` : '/student/messages',
      metadata: { from: senderName, applicationId, channel: 'ngo_message' },
    });

    // Email is best-effort: the in-app message is already delivered, so a mail
    // outage must not fail the request and lose the message entirely.
    let emailed = false;
    try {
      await sendTransactionalEmail({
        to: student.email,
        subject: `${subject} — ${senderName}`,
        heading: subject,
        body: `${body}\n\n— ${senderName}`,
        actionLabel: 'View on KaamLok',
        actionUrl: `${config.clientOrigin}/student/messages`,
      });
      emailed = true;
    } catch (err) {
      console.error(`[ngo] In-app message saved but email to ${student.email} failed:`, (err as Error).message);
    }

    return {
      message: emailed
        ? 'Message delivered to the student'
        : 'Message saved to the student inbox (email delivery unavailable)',
      notificationId: notification._id.toString(),
      emailed,
    };
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

    // Query by interview existence, NOT application status.
    // Completed interviews have status 'selected'/'rejected', so filtering by
    // status:'interview_scheduled' would hide them.
    const query: Record<string, unknown> = {
      ngoId,
      'interview.scheduledAt': { $exists: true, $ne: null },
    };

    if (courseId) query.courseId = courseId;

    if (status === 'upcoming') {
      query['interview.completed'] = { $ne: true };
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

    if (!app.interview || !app.interview.scheduledAt) {
      throw new ApiError(400, 'No interview scheduled for this application', 'NO_INTERVIEW');
    }

    // Persist interview completion BEFORE updating status.
    // updateApplicationStatus does a fresh findOne, so we must save first.
    app.interview.completed = true;
    app.interview.feedback = data.feedback;
    await app.save();

    // Update status based on outcome (handles seat sync internally)
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

  // ─── Notifications ────────────────────────────────────────────────
  async getNotifications(ngoId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const query = { recipientId: ngoId };

    const [notifications, total, unread] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, isRead: false }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        _id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        read: n.isRead,
        link: n.link,
        actionUrl: n.link,
        createdAt: n.createdAt.toISOString(),
        metadata: n.metadata,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      unreadCount: unread,
    };
  },

  async markNotificationRead(ngoId: string, notificationId: string) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: ngoId },
      { isRead: true }
    );
    return { message: 'Notification marked as read' };
  },

  async markAllNotificationsRead(ngoId: string) {
    await Notification.updateMany({ recipientId: ngoId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(ngoId: string, notificationId: string) {
    await Notification.deleteOne({ _id: notificationId, recipientId: ngoId });
    return { message: 'Notification deleted' };
  },

  // ─── Settings ──────────────────────────────────────────────────
  async getSettings(ngoId: string) {
    const profile = await NGOProfile.findOne({ user: ngoId });
    if (!profile) throw new ApiError(404, 'NGO profile not found', 'NOT_FOUND');
    return {
      notificationSettings: (profile as NGOProfileWithSettings).notificationSettings || {
        emailNotifications: true,
        applicationAlerts: true,
        interviewReminders: true,
        courseUpdates: true,
        marketingEmails: false,
      },
      preferences: (profile as NGOProfileWithSettings).preferences || {
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
      },
    };
  },

  // //async getSettings(ngoId: string) {
  //   const profile = await NGOProfile.findOne({ user: ngoId });
  //   if (!profile) throw new ApiError(404, 'NGO profile not found', 'NOT_FOUND');
  //   return {
  //     notificationSettings: profile.notificationSettings || {
  //       emailNotifications: true,
  //       applicationAlerts: true,
  //       interviewReminders: true,
  //       courseUpdates: true,
  //       marketingEmails: false,
  //     },
  //     preferences: profile.preferences || {
  //       language: 'en',
  //       timezone: 'Asia/Kolkata',
  //       dateFormat: 'DD/MM/YYYY',
  //     },
  //   };
  // },

  async updateNotificationSettings(ngoId: string, settings: Record<string, boolean>) {
    const profile = await NGOProfile.findOneAndUpdate(
      { user: ngoId },
      { $set: { notificationSettings: settings } },
      { new: true, upsert: true }
    );
    return { notificationSettings: (profile as NGOProfileWithSettings).notificationSettings };
  },

  //    return { notificationSettings: profile.notificationSettings };
  // },

  async updatePreferences(ngoId: string, preferences: Record<string, string>) {
    const profile = await NGOProfile.findOneAndUpdate(
      { user: ngoId },
      { $set: { preferences } },
      { new: true, upsert: true }
    );
    return { preferences: (profile as NGOProfileWithSettings).preferences };
  },

  //   return { preferences: profile.preferences };
  // },

  // ─── Success Stories ──────────────────────────────────────────
  async getPendingSuccessStories(ngoId: string) {
    const stories = await SuccessStory.find({
      ngoId,
      isPublished: false,
    })
      .sort({ createdAt: -1 })
      .populate('courseId', 'title slug')
      .lean();

    return stories.map((s) => ({
      _id: s._id.toString(),
      studentName: s.studentName,
      studentPhoto: s.studentPhoto,
      courseTitle: s.courseTitle,
      beforeStory: s.beforeStory,
      afterStory: s.afterStory,
      quote: s.quote,
      skillsLearned: s.skillsLearned,
      currentRole: s.currentRole,
      currentCompany: s.currentCompany,
      createdAt: s.createdAt.toISOString(),
    }));
  },

  async approveSuccessStory(ngoId: string, storyId: string) {
    const story = await SuccessStory.findOneAndUpdate(
      { _id: storyId, ngoId },
      { isPublished: true },
      { new: true }
    );
    if (!story) throw new ApiError(404, 'Success story not found', 'NOT_FOUND');
    return { message: 'Success story approved and published' };
  },

  async rejectSuccessStory(ngoId: string, storyId: string) {
    const result = await SuccessStory.deleteOne({ _id: storyId, ngoId, isPublished: false });
    if (result.deletedCount === 0) throw new ApiError(404, 'Story not found or already published', 'NOT_FOUND');
    return { message: 'Success story rejected' };
  },

  async getPublishedSuccessStories(ngoId: string) {
    const stories = await SuccessStory.find({ ngoId, isPublished: true })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();
    return stories.map((s) => ({
      _id: s._id.toString(),
      studentName: s.studentName,
      studentPhoto: s.studentPhoto,
      studentCity: s.studentCity,
      courseTitle: s.courseTitle,
      skillsLearned: s.skillsLearned,
      currentRole: s.currentRole,
      currentCompany: s.currentCompany,
      quote: s.quote,
      beforeStory: s.beforeStory,
      afterStory: s.afterStory,
      completionDate: s.completionDate?.toISOString(),
      isFeatured: s.isFeatured,
    }));
  },
};
