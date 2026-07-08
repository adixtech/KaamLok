import { Schema, model, type Document, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
/**
 * Admin sub-roles for fine-grained RBAC.
 * `super_admin` has unrestricted access; all others are scoped by permissions.
 * New roles can be added here without touching the service/controller layer.
 */
export type AdminRole =
  | 'super_admin'
  | 'operations_admin'
  | 'verification_admin'
  | 'support_admin'
  | 'analytics_admin'
  | 'content_admin'
  | 'csr_admin';

/**
 * Granular permissions. Each maps to a feature area + action.
 * The `authorizePermission` middleware checks these against the admin's role.
 */
export type Permission =
  | 'admin:create'
  | 'admin:read'
  | 'admin:update'
  | 'admin:delete'
  | 'admin:reset_password'
  | 'ngo:approve'
  | 'ngo:reject'
  | 'ngo:suspend'
  | 'ngo:delete'
  | 'student:block'
  | 'student:delete'
  | 'course:create'
  | 'course:update'
  | 'course:delete'
  | 'application:read'
  | 'application:update'
  | 'report:read'
  | 'report:export'
  | 'settings:update'
  | 'audit:read'
  | 'notification:manage';

/**
 * Default permission sets per role. Super Admin gets everything.
 * To add a new role, add an entry here — no code changes elsewhere.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'admin:create', 'admin:read', 'admin:update', 'admin:delete', 'admin:reset_password',
    'ngo:approve', 'ngo:reject', 'ngo:suspend', 'ngo:delete',
    'student:block', 'student:delete',
    'course:create', 'course:update', 'course:delete',
    'application:read', 'application:update',
    'report:read', 'report:export',
    'settings:update', 'audit:read', 'notification:manage',
  ],
  operations_admin: [
    'admin:read',
    'ngo:approve', 'ngo:reject', 'ngo:suspend',
    'student:block',
    'course:create', 'course:update',
    'application:read', 'application:update',
    'report:read',
  ],
  verification_admin: [
    'ngo:approve', 'ngo:reject',
    'application:read', 'application:update',
    'report:read',
  ],
  support_admin: [
    'admin:read',
    'student:block',
    'application:read',
    'notification:manage',
  ],
  analytics_admin: [
    'report:read', 'report:export',
    'application:read',
  ],
  content_admin: [
    'course:create', 'course:update', 'course:delete',
    'application:read',
  ],
  csr_admin: [
    'application:read',
    'report:read',
  ],
};

export interface IAdmin extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  adminRole: AdminRole;
  permissions: Permission[];
  isActive: boolean;
  isSuspended: boolean;
  lastLogin: Date | null;
  createdBy: Schema.Types.ObjectId | null;
  loginHistory: {
    timestamp: Date;
    ip: string;
    device: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  hasPermission(permission: Permission): boolean;
}

const adminSchema = new Schema<IAdmin>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    adminRole: {
      type: String,
      enum: [
        'super_admin', 'operations_admin', 'verification_admin',
        'support_admin', 'analytics_admin', 'content_admin', 'csr_admin',
      ],
      required: true,
      default: 'support_admin',
    },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ip: { type: String, default: '' },
        device: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    //const bcrypt = await import('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Sync permissions from role defaults if permissions array is empty
  if (this.isModified('adminRole') && this.permissions.length === 0) {
    this.permissions = ROLE_PERMISSIONS[this.adminRole] || [];
  }
  next();
});

adminSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  //const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.hasPermission = function (permission: Permission): boolean {
  if (this.adminRole === 'super_admin') return true;
  return this.permissions.includes(permission);
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

//adminSchema.index({ email: 1 });
adminSchema.index({ adminRole: 1 });
adminSchema.index({ isActive: 1 });

export const Admin: Model<IAdmin> = model<IAdmin>('Admin', adminSchema);
