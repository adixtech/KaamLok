import { Schema, model, type Document, type Model } from 'mongoose';

export type NotificationType =
  | 'ngo_approval'
  | 'ngo_rejection'
  | 'student_registration'
  | 'application_received'
  | 'system'
  | 'security';

export interface INotification extends Document {
  recipientId: Schema.Types.ObjectId | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'Admin', default: null, index: true },
    type: {
      type: String,
      enum: ['ngo_approval', 'ngo_rejection', 'student_registration', 'application_received', 'system', 'security'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    link: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> = model<INotification>('Notification', notificationSchema);
