// import { Course } from '../models/Course';
// import { Application, type IApplication } from '../models/Application';
// import { StudentProfile } from '../models/StudentProfile';
// import { ApiError } from '../utils/errors';

// /**
//  * Student Service - Business logic for student-facing course actions
//  * (apply to courses, check application status)
//  */

// function serializeApplication(app: IApplication) {
//   return {
//     _id: app._id.toString(),
//     studentId: app.studentId.toString(),
//     courseId: app.courseId.toString(),
//     ngoId: app.ngoId.toString(),
//     message: app.message,
//     documents: app.documents,
//     resume: app.resume,
//     status: app.status,
//     statusHistory: app.statusHistory.map((h) => ({
//       status: h.status,
//       changedAt: h.changedAt.toISOString(),
//       changedBy: h.changedBy?.toString(),
//       note: h.note,
//     })),
//     interview: app.interview
//       ? {
//           ...app.interview,
//           scheduledAt: app.interview.scheduledAt?.toISOString(),
//           conductedBy: app.interview.conductedBy?.toString(),
//         }
//       : undefined,
//     ngoNotes: app.ngoNotes,
//     createdAt: app.createdAt.toISOString(),
//     updatedAt: app.updatedAt.toISOString(),
//   };
// }

// export const studentService = {
//   async applyToCourse(
//     studentId: string,
//     courseId: string,
//     data: { message?: string; documents?: string[]; resume?: string }
//   ) {
//     const course = await Course.findOne({ _id: courseId, isPublished: true, status: 'published' });
//     if (!course) throw new ApiError(404, 'Course not found or not available', 'COURSE_NOT_FOUND');

//     if (new Date() > course.schedule.applicationEnd) {
//       throw new ApiError(400, 'Applications for this course have closed', 'APPLICATIONS_CLOSED');
//     }

//     if (course.availableSeats <= 0 && !course.waitingListEnabled) {
//       throw new ApiError(400, 'This batch is full', 'BATCH_FULL');
//     }

//     const existing = await Application.findOne({ studentId, courseId });
//     if (existing) {
//       throw new ApiError(409, 'You have already applied to this course', 'ALREADY_APPLIED');
//     }

//     const application = await Application.create({
//       studentId,
//       courseId,
//       ngoId: course.ngoId,
//       message: data.message,
//       documents: data.documents || [],
//       resume: data.resume,
//       status: 'pending',
//       statusHistory: [
//         {
//           status: 'pending',
//           changedAt: new Date(),
//           note: 'Application submitted',
//         },
//       ],
//     });

//     await Course.updateOne({ _id: courseId }, { $inc: { applicationsCount: 1 } });

//     return { application: serializeApplication(application), message: 'Application submitted successfully!' };
//   },

//   async getApplicationStatus(studentId: string, courseId: string) {
//     const application = await Application.findOne({ studentId, courseId })
//       .populate('courseId', 'title slug')
//       .populate('ngoId', 'firstName ngoName');

//     if (!application) return { application: null };

//     return { application: serializeApplication(application) };
//   },

//   async getMyApplications(studentId: string, params: { page?: number; limit?: number }) {
//     const { page = 1, limit = 20 } = params;
//     const skip = (page - 1) * limit;

//     const query: Record<string, unknown> = { studentId };
//     const [applications, total] = await Promise.all([
//       Application.find(query)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate('courseId', 'title slug thumbnail category mode')
//         .populate('ngoId', 'firstName ngoName logo'),
//       Application.countDocuments(query),
//     ]);

//     return {
//       applications: applications.map((a) => ({
//         ...serializeApplication(a),
//         course: a.courseId,
//         ngo: a.ngoId,
//       })),
//       pagination: { page, limit, total, pages: Math.ceil(total / limit) },
//     };
//   },
// };
import { Course } from '../models/Course';
import { Application, type IApplication, type ApplicationStatus } from '../models/Application';
import { StudentProfile, type IStudentProfile } from '../models/StudentProfile';
import { SavedCourse } from '../models/SavedCourse';
import { NGOProfile } from '../models/NGOProfile';
import { User } from '../models/User';
import { Certificate } from '../models/Certificate';
import { SuccessStory } from '../models/SuccessStory';
import { ApiError } from '../utils/errors';

/**
 * Student Service - Business logic for student dashboard
 */

function serializeApplication(app: IApplication, populatedCourse?: unknown, populatedNgo?: unknown) {
  const course = populatedCourse || app.courseId;
  const ngo = populatedNgo || app.ngoId;
  return {
    _id: app._id.toString(),
    studentId: app.studentId.toString(),
    courseId: app.courseId.toString(),
    ngoId: app.ngoId.toString(),
    course,
    ngo,
    message: app.message,
    documents: app.documents,
    resume: app.resume,
    status: app.status,
    statusHistory: app.statusHistory.map((h) => ({
      status: h.status,
      changedAt: h.changedAt.toISOString(),
      changedBy: h.changedBy?.toString(),
      note: h.note,
    })),
    interview: app.interview
      ? {
          ...app.interview,
          scheduledAt: app.interview.scheduledAt?.toISOString(),
          conductedBy: app.interview.conductedBy?.toString(),
        }
      : undefined,
    ngoNotes: app.ngoNotes,
    score: app.score,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

function computeProfileCompletion(profile: IStudentProfile | null, user: { firstName?: string; email?: string; phone?: string } | null): number {
  if (!profile) return 10;
  let score = 10; // baseline for having account
  if (user?.firstName) score += 5;
  if (profile.education) score += 10;
  if (profile.city && profile.state) score += 10;
  if (profile.phone || user?.phone) score += 5;
  if (profile.photo) score += 10;
  if (profile.bio) score += 5;
  if (profile.skills?.length > 0) score += 10;
  if (profile.dateOfBirth) score += 5;
  if (profile.resume) score += 10;
  if ((profile.educationDetails?.length ?? 0) > 0) score += 5;
  if ((profile.experience?.length ?? 0) > 0) score += 5;
  if ((profile.languages?.length ?? 0) > 0) score += 5;
  if (profile.socialLinks?.linkedin) score += 5;
  return Math.min(score, 100);
}

export const studentService = {
  // ─── Applications ────────────────────────────────────────────
  async applyToCourse(
    studentId: string,
    courseId: string,
    data: { message?: string; documents?: string[]; resume?: string }
  ) {
    const course = await Course.findOne({ _id: courseId, isPublished: true, status: 'published' });
    if (!course) throw new ApiError(404, 'Course not found or not available', 'COURSE_NOT_FOUND');

    // Verify the NGO owning this course is still verified + active
    const ngoUser = await User.findById(course.ngoId).select('role status');
    if (!ngoUser || ngoUser.role !== 'ngo' || ngoUser.status !== 'active') {
      throw new ApiError(403, 'This organization is not currently accepting applications', 'NGO_UNAVAILABLE');
    }

    if (new Date() > course.schedule.applicationEnd) {
      throw new ApiError(400, 'Applications for this course have closed', 'APPLICATIONS_CLOSED');
    }

    if (course.availableSeats <= 0 && !course.waitingListEnabled) {
      throw new ApiError(400, 'This batch is full', 'BATCH_FULL');
    }

    const existing = await Application.findOne({ studentId, courseId });
    if (existing) {
      throw new ApiError(409, 'You have already applied to this course', 'ALREADY_APPLIED');
    }

    const application = await Application.create({
      studentId,
      courseId,
      ngoId: course.ngoId,
      message: data.message,
      documents: data.documents || [],
      resume: data.resume,
      status: 'pending',
      statusHistory: [{ status: 'pending', changedAt: new Date(), note: 'Application submitted' }],
    });

    await Course.updateOne({ _id: courseId }, { $inc: { applicationsCount: 1 } });

    return { application: serializeApplication(application), message: 'Application submitted successfully!' };
  },

  async getApplicationStatus(studentId: string, courseId: string) {
    const application = await Application.findOne({ studentId, courseId });
    if (!application) return { application: null };
    return { application: serializeApplication(application) };
  },

  async getMyApplications(studentId: string, params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { studentId };
    if (status) query.status = status;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('courseId', 'title slug thumbnail category mode schedule ngoName ngoLogo contact')
        .populate('ngoId', 'firstName ngoName email'),
      Application.countDocuments(query),
    ]);

    return {
      applications: applications.map((a) => serializeApplication(a, a.courseId, a.ngoId)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async withdrawApplication(studentId: string, applicationId: string) {
    const app = await Application.findOne({ _id: applicationId, studentId });
    if (!app) throw new ApiError(404, 'Application not found', 'NOT_FOUND');
    if (!['pending', 'under_review'].includes(app.status)) {
      throw new ApiError(400, 'Cannot withdraw application at this stage', 'CANNOT_WITHDRAW');
    }
    app.status = 'withdrawn';
    app.$locals.changedBy = studentId;
    app.$locals.statusNote = 'Withdrawn by student';
    await app.save();
    return { message: 'Application withdrawn successfully' };
  },

  // ─── Dashboard Stats ─────────────────────────────────────────
  async getDashboardStats(studentId: string) {
    const [
      totalApplications,
      activeApplications,
      selectedApplications,
      upcomingInterviews,
      trainingCourses,
      completedCourses,
      savedCount,
    ] = await Promise.all([
      Application.countDocuments({ studentId }),
      Application.countDocuments({ studentId, status: { $in: ['pending', 'under_review', 'shortlisted', 'waitlisted'] } }),
      Application.countDocuments({ studentId, status: 'selected' }),
      Application.countDocuments({ studentId, status: 'interview_scheduled', 'interview.scheduledAt': { $gte: new Date() } }),
      Application.countDocuments({ studentId, status: 'selected' }),
      Application.countDocuments({ studentId, status: 'selected' }),
      SavedCourse.countDocuments({ studentId }),
    ]);

    // Get recent applications for timeline
    const recentApplications = await Application.find({ studentId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('courseId', 'title slug thumbnail category ngoName ngoLogo schedule');

    // Get upcoming interviews
    const interviews = await Application.find({
      studentId,
      status: 'interview_scheduled',
      'interview.scheduledAt': { $gte: new Date() },
    })
      .sort({ 'interview.scheduledAt': 1 })
      .limit(3)
      .populate('courseId', 'title slug category ngoName ngoLogo');

    // Get upcoming deadlines (open applications near deadline)
    const openApps = await Application.find({
      studentId,
      status: { $in: ['pending', 'under_review', 'shortlisted'] },
    })
      .populate('courseId', 'title slug schedule ngoName availableSeats')
      .limit(5);

    const upcomingDeadlines = openApps
      .map((a) => {
        const c = a.courseId as unknown as { schedule?: { applicationEnd?: string }; title?: string; slug?: string; ngoName?: string };
        if (!c?.schedule?.applicationEnd) return null;
        const daysLeft = Math.ceil((new Date(c.schedule.applicationEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return { applicationId: a._id, course: c, daysLeft };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.daysLeft - b!.daysLeft));

    return {
      stats: {
        totalApplications,
        activeApplications,
        selectedApplications,
        upcomingInterviews,
        trainingCourses,
        completedCourses,
        savedCourses: savedCount,
        certificates: completedCourses,
      },
      recentActivity: recentApplications.map((a) => serializeApplication(a, a.courseId, a.ngoId)),
      upcomingInterviews: interviews.map((a) => serializeApplication(a, a.courseId, a.ngoId)),
      upcomingDeadlines,
    };
  },

  // ─── Profile ─────────────────────────────────────────────────
  async getProfile(studentId: string) {
    const [user, profile] = await Promise.all([
      User.findById(studentId).select('firstName lastName email phone role status createdAt'),
      StudentProfile.findOne({ user: studentId }),
    ]);
    if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');

    const completion = computeProfileCompletion(profile, user as unknown as { firstName?: string; email?: string; phone?: string });

    if (profile) {
      await StudentProfile.updateOne({ user: studentId }, { profileCompletionScore: completion });
    }

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
            profileCompletionScore: completion,
          }
        : null,
      profileCompletionScore: completion,
    };
  },

  async updateProfile(studentId: string, data: {
    // User fields
    firstName?: string;
    lastName?: string;
    phone?: string;
    // Profile fields
    education?: string;
    city?: string;
    state?: string;
    skills?: string[];
    dateOfBirth?: string;
    gender?: string;
    alternativePhone?: string;
    address?: string;
    pin?: string;
    photo?: string;
    bio?: string;
    educationDetails?: unknown[];
    experience?: unknown[];
    languages?: string[];
    emergencyContact?: unknown;
    resume?: string;
    portfolio?: string;
    socialLinks?: unknown;
  }) {
    const userUpdate: Record<string, unknown> = {};
    if (data.firstName) userUpdate.firstName = data.firstName;
    if (data.lastName) userUpdate.lastName = data.lastName;
    if (data.phone) userUpdate.phone = data.phone;

    const profileUpdate: Record<string, unknown> = {};
    const profileFields = ['education', 'city', 'state', 'skills', 'gender', 'alternativePhone', 'address', 'pin', 'photo', 'bio', 'educationDetails', 'experience', 'languages', 'emergencyContact', 'resume', 'portfolio', 'socialLinks'];
    for (const f of profileFields) {
      if (data[f as keyof typeof data] !== undefined) profileUpdate[f] = data[f as keyof typeof data];
    }
    if (data.dateOfBirth) profileUpdate.dateOfBirth = new Date(data.dateOfBirth);

    const [user] = await Promise.all([
      Object.keys(userUpdate).length > 0
        ? User.findByIdAndUpdate(studentId, userUpdate, { new: true }).select('firstName lastName email phone')
        : User.findById(studentId).select('firstName lastName email phone'),
      Object.keys(profileUpdate).length > 0
        ? StudentProfile.findOneAndUpdate(
            { user: studentId },
            { $set: profileUpdate },
            { new: true, upsert: true }
          )
        : StudentProfile.findOne({ user: studentId }),
    ]);

    const profile = await StudentProfile.findOne({ user: studentId });
    const completion = computeProfileCompletion(profile, user as unknown as { firstName?: string; email?: string; phone?: string });
    await StudentProfile.updateOne({ user: studentId }, { profileCompletionScore: completion });

    return { message: 'Profile updated successfully', profileCompletionScore: completion };
  },

  // ─── Saved Courses ────────────────────────────────────────────
  async getSavedCourses(studentId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 12 } = params;
    const skip = (page - 1) * limit;

    const [saved, total] = await Promise.all([
      SavedCourse.find({ studentId })
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('courseId', 'title slug shortDescription category mode thumbnail schedule totalSeats filledSeats ngoName ngoLogo ngoVerificationStatus status isPublished applicationsCount'),
      SavedCourse.countDocuments({ studentId }),
    ]);

    const courses = saved.map((s) => ({
      savedId: s._id.toString(),
      savedAt: s.savedAt.toISOString(),
      course: s.courseId,
    }));

    return { courses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  async saveCourse(studentId: string, courseId: string) {
    const course = await Course.findOne({ _id: courseId, isPublished: true });
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    const existing = await SavedCourse.findOne({ studentId, courseId });
    if (existing) throw new ApiError(409, 'Course already saved', 'ALREADY_SAVED');

    await SavedCourse.create({ studentId, courseId });
    return { message: 'Course saved successfully' };
  },

  async unsaveCourse(studentId: string, courseId: string) {
    await SavedCourse.deleteOne({ studentId, courseId });
    return { message: 'Course removed from saved' };
  },

  async isCoursesSaved(studentId: string, courseIds: string[]) {
    const saved = await SavedCourse.find({ studentId, courseId: { $in: courseIds } }).select('courseId');
    const savedSet = new Set(saved.map((s) => s.courseId.toString()));
    return courseIds.reduce((acc, id) => ({ ...acc, [id]: savedSet.has(id) }), {} as Record<string, boolean>);
  },

  // ─── NGO Directory ────────────────────────────────────────────
  async getNGODirectory(params: { page?: number; limit?: number; search?: string; state?: string }) {
    const { page = 1, limit = 12, search, state } = params;
    const skip = (page - 1) * limit;

    // Same canonical filter as publicService: approved + active user
    const activeUsers = await User.find({ role: 'ngo', status: 'active' }).select('_id').lean();
    const userIds = activeUsers.map((u) => u._id);
    const query: Record<string, unknown> = {
      verificationStatus: 'approved',
      user: { $in: userIds },
    };
    if (state) query.state = state;
    if (search) {
      query.$or = [
        { ngoName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sectorsFocused: { $regex: search, $options: 'i' } },
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

    return { ngos: ngosWithCounts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  // ─── Notifications ────────────────────────────────────────────
  async getStudentNotifications(studentId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const query = { recipientId: studentId };
    const notifModel = (await import('../models/Notification')).Notification;

    const [notifications, total, unread] = await Promise.all([
      notifModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit),
      notifModel.countDocuments(query),
      notifModel.countDocuments({ ...query, isRead: false }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        _id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        link: n.link,
        metadata: n.metadata,
        createdAt: n.createdAt?.toISOString(),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      unreadCount: unread,
    };
  },

  async markNotificationRead(studentId: string, notificationId: string) {
    const notifModel = (await import('../models/Notification')).Notification;
    await notifModel.findOneAndUpdate(
      { _id: notificationId, recipientId: studentId },
      { isRead: true }
    );
    return { message: 'Notification marked as read' };
  },

  async markAllNotificationsRead(studentId: string) {
    const notifModel = (await import('../models/Notification')).Notification;
    await notifModel.updateMany({ recipientId: studentId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(studentId: string, notificationId: string) {
    const notifModel = (await import('../models/Notification')).Notification;
    await notifModel.deleteOne({ _id: notificationId, recipientId: studentId });
    return { message: 'Notification deleted' };
  },

  // ─── Certificates ─────────────────────────────────────────────
  async getCertificates(studentId: string) {
    const certificates = await Certificate.find({ studentId, status: 'issued' })
      .sort({ issueDate: -1 })
      .populate('courseId', 'title slug thumbnail category mode ngoName ngoLogo')
      .lean();

    return certificates.map((c) => ({
      _id: c._id.toString(),
      certificateNumber: c.certificateNumber,
      courseTitle: c.courseTitle,
      issueDate: c.issueDate.toISOString(),
      grade: c.grade,
      skillsAcquired: c.skillsAcquired,
      ngoName: c.ngoName,
      course: c.courseId,
    }));
  },

  // ─── Success Stories ──────────────────────────────────────────
  async submitSuccessStory(
    studentId: string,
    data: {
      courseId: string;
      beforeStory: string;
      afterStory: string;
      quote: string;
      skillsLearned?: string[];
      currentRole?: string;
      currentCompany?: string;
      currentSalary?: string;
    }
  ) {
    // Verify the student was selected for this course (completed training)
    const application = await Application.findOne({
      studentId,
      courseId: data.courseId,
      status: 'selected',
    }).populate('courseId', 'title').populate('ngoId', 'firstName ngoName');

    if (!application) {
      throw new ApiError(403, 'You can only submit a story for a course you have been selected for', 'NOT_ELIGIBLE');
    }

    const course = application.courseId as unknown as { title: string };
    const ngo = application.ngoId as unknown as { _id: string; ngoName: string; firstName: string };

    const user = await User.findById(studentId);
    if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');
    const studentName = `${user.firstName} ${user.lastName || ''}`.trim();

    // Check for duplicate story
    const existing = await SuccessStory.findOne({ studentName, courseId: data.courseId });
    if (existing) {
      throw new ApiError(409, 'You have already submitted a success story for this course', 'DUPLICATE_STORY');
    }
    const profile = await StudentProfile.findOne({ user: studentId });

    const story = await SuccessStory.create({
      studentName,
      studentPhoto: profile?.photo,
      studentCity: profile?.city,
      ngoId: ngo._id,
      ngoName: ngo.ngoName || ngo.firstName,
      courseId: data.courseId,
      courseTitle: course.title,
      skillsLearned: data.skillsLearned || [],
      currentRole: data.currentRole,
      currentCompany: data.currentCompany,
      currentSalary: data.currentSalary,
      beforeStory: data.beforeStory,
      afterStory: data.afterStory,
      quote: data.quote,
      completionDate: new Date(),
      isPublished: false,
      isFeatured: false,
    });

    return { story: { _id: story._id.toString(), message: 'Success story submitted for review' } };
  },

  async getMySuccessStories(studentId: string) {
    const user = await User.findById(studentId);
    if (!user) return { stories: [] };
    const studentName = `${user.firstName} ${user.lastName || ''}`.trim();
    const stories = await SuccessStory.find({ studentName })
      .sort({ createdAt: -1 })
      .select('courseTitle ngoName isPublished isFeatured createdAt completionDate');
    return {
      stories: stories.map((s) => ({
        _id: s._id.toString(),
        courseTitle: s.courseTitle,
        ngoName: s.ngoName,
        isPublished: s.isPublished,
        isFeatured: s.isFeatured,
        createdAt: s.createdAt.toISOString(),
        completionDate: s.completionDate?.toISOString(),
      })),
    };
  },

  // ─── Timeline ─────────────────────────────────────────────────
  async getTimeline(studentId: string, params: { retentionDays?: number }) {
    const retentionDays = params.retentionDays ?? 90;
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    // Timeline events are derived from application status history (temporary dashboard activity)
    // Only show events within the retention period — older events are archived (not shown)
    // Core application records are NOT deleted
    const applications = await Application.find({
      studentId,
      updatedAt: { $gte: cutoffDate },
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate('courseId', 'title slug thumbnail category ngoName ngoLogo')
      .select('status statusHistory createdAt updatedAt courseId');

    const events: Array<{
      _id: string;
      type: string;
      status: string;
      courseTitle: string;
      course?: unknown;
      timestamp: string;
    }> = [];

    for (const app of applications) {
      const course = app.courseId as unknown as { title?: string; slug?: string; thumbnail?: string; category?: string; ngoName?: string; ngoLogo?: string };
      for (const history of app.statusHistory) {
        if (new Date(history.changedAt) < cutoffDate) continue;
        events.push({
          _id: `${app._id}-${history.status}-${history.changedAt.getTime()}`,
          type: 'status_change',
          status: history.status,
          courseTitle: course?.title || 'Unknown Course',
          course,
          timestamp: history.changedAt.toISOString(),
        });
      }
    }

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      events: events.slice(0, 20),
      retentionDays,
      archivedCount: 0,
    };
  },

  // ─── Settings ─────────────────────────────────────────────────
  async getSettings(studentId: string) {
    const profile = await StudentProfile.findOne({ user: studentId });
    return {
      notificationSettings: (profile as unknown as { notificationSettings?: Record<string, boolean> })?.notificationSettings || {
        emailNotifications: true,
        applicationUpdates: true,
        interviewReminders: true,
        courseRecommendations: true,
        marketingEmails: false,
      },
      preferences: (profile as unknown as { preferences?: Record<string, string> })?.preferences || {
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
      },
    };
  },

  async updateNotificationSettings(studentId: string, settings: Record<string, boolean>) {
    await StudentProfile.findOneAndUpdate(
      { user: studentId },
      { $set: { notificationSettings: settings } },
      { new: true, upsert: true }
    );
    return { message: 'Notification preferences saved' };
  },

  async updatePreferences(studentId: string, preferences: Record<string, string>) {
    await StudentProfile.findOneAndUpdate(
      { user: studentId },
      { $set: { preferences } },
      { new: true, upsert: true }
    );
    return { message: 'Preferences saved' };
  },
};
