import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Ban, RotateCcw, Trash2, KeyRound, ShieldAlert,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminBadge, statusTone } from '../../components/admin/AdminBadge';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminModal } from '../../components/admin/AdminModal';
import { ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';
import type { AdminUser, AdminRole, Pagination } from '../../types/admin';
import { ADMIN_ROLE_LABELS } from '../../types/admin';

type Action =
  | { type: 'suspend'; admin: AdminUser }
  | { type: 'reactivate'; admin: AdminUser }
  | { type: 'delete'; admin: AdminUser }
  | { type: 'resetPassword'; admin: AdminUser }
  | null;

const ROLES = Object.keys(ADMIN_ROLE_LABELS) as AdminRole[];

export function AdminManagementPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', adminRole: 'support_admin' as AdminRole });

  const isSuperAdmin = user?.role === 'admin' && (user as unknown as { adminRole?: string }).adminRole === 'super_admin';

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listAdmins(page, 20);
      setAdmins(data.admins);
      setPagination(data.pagination);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const openCreate = () => {
    setEditAdmin(null);
    setForm({ firstName: '', lastName: '', email: '', password: '', adminRole: 'support_admin' });
    setShowForm(true);
  };

  const openEdit = (admin: AdminUser) => {
    setEditAdmin(admin);
    setForm({ firstName: admin.firstName, lastName: admin.lastName, email: admin.email, password: '', adminRole: admin.adminRole });
    setShowForm(true);
  };

  const submitForm = async () => {
    setBusy(true);
    try {
      if (editAdmin) {
        await adminApi.updateAdmin(editAdmin.id, { firstName: form.firstName, lastName: form.lastName, adminRole: form.adminRole });
        toast.success('Admin updated');
      } else {
        await adminApi.createAdmin(form);
        toast.success('Admin created');
      }
      setShowForm(false);
      fetchAdmins();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save admin');
    } finally {
      setBusy(false);
    }
  };

  const closeAction = () => { setAction(null); setReason(''); setNewPassword(''); };

  const runAction = async () => {
    if (!action) return;
    setBusy(true);
    try {
      const { id } = action.admin;
      switch (action.type) {
        case 'suspend': await adminApi.suspendAdmin(id, reason); break;
        case 'reactivate': await adminApi.reactivateAdmin(id); break;
        case 'delete': await adminApi.deleteAdmin(id, reason); break;
        case 'resetPassword': await adminApi.resetAdminPassword(id, newPassword); break;
      }
      toast.success(`${action.type} succeeded`);
      closeAction();
      fetchAdmins();
    } catch (err) {
      toast.error((err as Error)?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500" />
          <h2 className="mt-4 text-lg font-bold text-ink-900">Access Denied</h2>
          <p className="mt-1 text-sm text-ink-500">Only Super Admins can manage admin accounts.</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={fetchAdmins} /></AdminLayout>;
  }

  const actionTitle = action ? action.type.charAt(0).toUpperCase() + action.type.slice(1) : '';
  const actionDanger = action?.type === 'delete' || action?.type === 'suspend';

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Admin Management</h1>
          <p className="mt-1 text-sm text-ink-500">Create and manage admin accounts</p>
        </div>
        <AdminButton icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Admin</AdminButton>
      </div>

      <AdminTable
        loading={loading}
        data={admins as unknown as Record<string, unknown>[]}
        rowKey={(a) => (a as unknown as AdminUser).id}
        emptyMessage="No admins found"
        columns={[
          { key: 'name', header: 'Name', render: (a) => { const x = a as unknown as AdminUser; return <span className="font-semibold text-ink-900">{x.firstName} {x.lastName}</span>; } },
          { key: 'email', header: 'Email', render: (a) => (a as unknown as AdminUser).email },
          { key: 'adminRole', header: 'Role', render: (a) => <AdminBadge tone="brand">{ADMIN_ROLE_LABELS[(a as unknown as AdminUser).adminRole]}</AdminBadge> },
          { key: 'status', header: 'Status', render: (a) => { const x = a as unknown as AdminUser; return <AdminBadge tone={x.isSuspended ? statusTone('suspended') : statusTone('active')}>{x.isSuspended ? 'Suspended' : 'Active'}</AdminBadge>; } },
          { key: 'createdAt', header: 'Created', render: (a) => new Date((a as unknown as AdminUser).createdAt).toLocaleDateString() },
          {
            key: 'actions', header: 'Actions', className: 'text-right',
            render: (a) => { const x = a as unknown as AdminUser; return (
              <div className="flex items-center justify-end gap-1">
                <IconBtn title="Edit" onClick={() => openEdit(x)}><Pencil className="h-4 w-4" /></IconBtn>
                {x.isSuspended ? (
                  <IconBtn title="Reactivate" onClick={() => setAction({ type: 'reactivate', admin: x })}><RotateCcw className="h-4 w-4 text-teal-600" /></IconBtn>
                ) : (
                  <IconBtn title="Suspend" onClick={() => setAction({ type: 'suspend', admin: x })}><Ban className="h-4 w-4 text-amber-600" /></IconBtn>
                )}
                <IconBtn title="Reset Password" onClick={() => setAction({ type: 'resetPassword', admin: x })}><KeyRound className="h-4 w-4 text-brand-600" /></IconBtn>
                <IconBtn title="Delete" onClick={() => setAction({ type: 'delete', admin: x })}><Trash2 className="h-4 w-4 text-rose-500" /></IconBtn>
              </div>
            ); },
          },
        ]}
      />

      <div className="mt-4">
        <AdminPagination page={pagination.page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
      </div>

      {/* Create/Edit Modal */}
      <AdminModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editAdmin ? 'Edit Admin' : 'Create Admin'}
        footer={
          <>
            <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100">Cancel</button>
            <AdminButton onClick={submitForm} disabled={busy}>{busy ? 'Saving...' : editAdmin ? 'Save' : 'Create'}</AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name"><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="admin-input" /></Field>
            <Field label="Last Name"><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="admin-input" /></Field>
          </div>
          <Field label="Email"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editAdmin} className="admin-input" /></Field>
          {!editAdmin && <Field label="Password"><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="admin-input" /></Field>}
          <Field label="Role">
            <select value={form.adminRole} onChange={(e) => setForm({ ...form, adminRole: e.target.value as AdminRole })} className="admin-input">
              {ROLES.map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
            </select>
          </Field>
        </div>
      </AdminModal>

      {/* Action Modal */}
      <AdminModal
        open={!!action}
        onClose={closeAction}
        title={actionTitle}
        size="sm"
        footer={
          <>
            <button onClick={closeAction} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100">Cancel</button>
            <button
              onClick={runAction}
              disabled={busy}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors disabled:opacity-60 ${actionDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'}`}
            >
              {busy ? 'Processing...' : actionTitle}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-ink-600">
            {action?.type === 'suspend' ? 'Suspend this admin? They will lose access temporarily.' :
             action?.type === 'delete' ? 'Permanently delete this admin? This cannot be undone.' :
             action?.type === 'reactivate' ? 'Reactivate this admin? Access will be restored.' :
             'Reset this admin\'s password?'}
          </p>
          {action && (action.type === 'suspend' || action.type === 'delete') && (
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason (required)..." className="w-full rounded-xl border border-ink-200 p-3 text-sm outline-none focus:border-brand-400" rows={3} />
          )}
          {action?.type === 'resetPassword' && (
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-ink-200 p-3 text-sm outline-none focus:border-brand-400" />
          )}
        </div>
      </AdminModal>
    </AdminLayout>
  );
}

function IconBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100">
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</label>
      {children}
    </div>
  );
}
