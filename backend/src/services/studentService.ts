import { Course } from '../models/Course';
import { Application, type IApplication } from '../models/Application';
import { StudentProfile } from '../models/StudentProfile';
import { ApiError } from '../utils/errors';

/**
 * Student Service - Business logic for student-facing course actions
 * (apply to courses, check application status)
 */

function serializeApplication(app: IApplication) {
  return {
    _id: app._id.toString(),
    studentId: app.studentId.toString(),
    courseId: app.courseId.toString(),
    ngoId: app.ngoId.toString(),
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
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

export const studentService = {
  async applyToCourse(
    studentId: string,
    courseId: string,
    data: { message?: string; documents?: string[]; resume?: string }
  ) {
    const course = await Course.findOne({ _id: courseId, isPublished: true, status: 'published' });
    if (!course) throw new ApiError(404, 'Course not found or not available', 'COURSE_NOT_FOUND');

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
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date(),
          note: 'Application submitted',
        },
      ],
    });

    await Course.updateOne({ _id: courseId }, { $inc: { applicationsCount: 1 } });

    return { application: serializeApplication(application), message: 'Application submitted successfully!' };
  },

  async getApplicationStatus(studentId: string, courseId: string) {
    const application = await Application.findOne({ studentId, courseId })
      .populate('courseId', 'title slug')
      .populate('ngoId', 'firstName ngoName');

    if (!application) return { application: null };

    return { application: serializeApplication(application) };
  },

  async getMyApplications(studentId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { studentId };
    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('courseId', 'title slug thumbnail category mode')
        .populate('ngoId', 'firstName ngoName logo'),
      Application.countDocuments(query),
    ]);

    return {
      applications: applications.map((a) => ({
        ...serializeApplication(a),
        course: a.courseId,
        ngo: a.ngoId,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },
};
