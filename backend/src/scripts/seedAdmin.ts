/**
 * Seed script — creates the initial Super Admin if none exists.
 * Run with: npx tsx src/scripts/seedAdmin.ts
 *
 * Reads credentials from env vars ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME
 * and falls back to safe dev defaults. Never hardcodes production credentials.
 */
import mongoose from 'mongoose';
import { config } from '../config/env';
import { Admin, ROLE_PERMISSIONS } from '../models/Admin';

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log('[Seed] Connected to MongoDB');

  const email = process.env.ADMIN_EMAIL || 'superadmin@kaamlok.in';
  const password = process.env.ADMIN_PASSWORD || 'SuperAdmin@2024';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Super';
  const lastName = process.env.ADMIN_LAST_NAME || 'Admin';

  const existing = await Admin.findOne({ adminRole: 'super_admin' });
  if (existing) {
    console.log(`[Seed] Super admin already exists: ${existing.email}`);
    process.exit(0);
  }

  const admin = await Admin.create({
    firstName,
    lastName,
    email,
    password,
    adminRole: 'super_admin',
    permissions: ROLE_PERMISSIONS['super_admin'],
    isActive: true,
    isSuspended: false,
    createdBy: null,
  });

  console.log(`[Seed] Super admin created: ${admin.email}`);
  console.log(`[Seed] Password: ${password}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
