import { Schema, model, type Document, type Model } from 'mongoose';

export type AuditAction =
  | 'admin_login'
  | 'admin_logout'
  | 'admin_create'
  | 'admin_update'
  | 'admin_delete'
  | 'admin_suspend'
  | 'admin_reactivate'
  | 'admin_reset_password'
  | 'ngo_approve'
  | 'ngo_reject'
  | 'ngo_suspend'
  | 'ngo_block'
  | 'ngo_reactivate'
  | 'ngo_delete'
  | 'ngo_request_docs'
  | 'student_block'
  | 'student_suspend'
  | 'student_reactivate'
  | 'student_delete'
  | 'course_create'
  | 'course_update'
  | 'course_delete'
  | 'application_update'
  | 'settings_update'
  | 'notification_send'
  | 'report_export';

export interface IAuditLog extends Document {
  adminId: Schema.Types.ObjectId;
  adminEmail: string;
  adminName: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetName: string;
  reason: string;
  metadata: Record<string, unknown>;
  ip: string;
  device: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    adminEmail: { type: String, required: true },
    adminName: { type: String, required: true },
    action: {
      type: String,
      enum: [
        'admin_login', 'admin_logout', 'admin_create', 'admin_update', 'admin_delete',
        'admin_suspend', 'admin_reactivate', 'admin_reset_password',
        'ngo_approve', 'ngo_reject', 'ngo_suspend', 'ngo_block', 'ngo_reactivate',
        'ngo_delete', 'ngo_request_docs',
        'student_block', 'student_suspend', 'student_reactivate', 'student_delete',
        'course_create', 'course_update', 'course_delete',
        'application_update', 'settings_update', 'notification_send', 'report_export',
      ],
      required: true,
    },
    targetType: { type: String, default: '' },
    targetId: { type: String, default: '' },
    targetName: { type: String, default: '' },
    reason: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
    device: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ adminId: 1, timestamp: -1 });

export const AuditLog: Model<IAuditLog> = model<IAuditLog>('AuditLog', auditLogSchema);
