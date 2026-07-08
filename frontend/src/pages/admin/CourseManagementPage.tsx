import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search, Plus, Pencil, Trash2, Star, Upload, Archive,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminBadge, statusTone } from '../../components/admin/AdminBadge';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminModal } from '../../components/admin/AdminModal';
import { ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import type { CourseItem, Pagination } from '../../types/admin';

const STATUSES = ['', 'published', 'draft', 'archived'];
const MODES = ['online', 'offline', 'hybrid'];

const emptyForm = { title: '', description: '', category: '', duration: '', mode: 'online', seats: 0 };

export function CourseManagementPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseItem | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteCourse, setDeleteCourse] = useState<CourseItem | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listCourses({ page, limit: 10, search, status });
      setCourses(data.courses);
      setPagination(data.pagination);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const applySearch = () => { setPage(1); fetchCourses(); };

  const openCreate = () => { setEditCourse(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (c: CourseItem) => { setEditCourse(c); setForm({ title: c.title, description: c.description, category: c.category, duration: c.duration, mode: c.mode, seats: c.seats }); setShowForm(true); };

  const submitForm = async () => {
    setBusy(true);
    try {
      if (editCourse) {
        await adminApi.updateCourse(editCourse._id, form);
        toast.success('Course updated');
      } else {
        await adminApi.createCourse(form);
        toast.success('Course created');
      }
      setShowForm(false);
      fetchCourses();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save course');
    } finally {
      setBusy(false);
    }
  };

  const toggleFeatured = async (c: CourseItem) => {
    try {
      await adminApi.updateCourse(c._id, { isFeatured: !c.isFeatured });
      toast.success(c.isFeatured ? 'Unfeatured' : 'Featured');
      fetchCourses();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed');
    }
  };

  const toggleStatus = async (c: CourseItem) => {
    const newStatus = c.status === 'published' ? 'archived' : 'published';
    try {
      await adminApi.updateCourse(c._id, { status: newStatus });
      toast.success(newStatus === 'published' ? 'Published' : 'Archived');
      fetchCourses();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteCourse) return;
    setBusy(true);
    try {
      await adminApi.deleteCourse(deleteCourse._id);
      toast.success('Course deleted');
      setDeleteCourse(null);
      fetchCourses();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={fetchCourses} /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Course Management</h1>
          <p className="mt-1 text-sm text-ink-500">Create and manage courses</p>
        </div>
        <AdminButton icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Course</AdminButton>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applySearch()} placeholder="Search courses..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-400">
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
        </select>
        <AdminButton size="md" onClick={applySearch}>Search</AdminButton>
      </div>

      <AdminTable
        loading={loading}
        data={courses as unknown as Record<string, unknown>[]}
        rowKey={(c) => (c as unknown as CourseItem)._id}
        emptyMessage="No courses found"
        columns={[
          { key: 'title', header: 'Title', render: (c) => <span className="font-semibold text-ink-900">{(c as unknown as CourseItem).title}</span> },
          { key: 'category', header: 'Category', render: (c) => (c as unknown as CourseItem).category },
          { key: 'mode', header: 'Mode', render: (c) => <AdminBadge tone="neutral">{(c as unknown as CourseItem).mode}</AdminBadge> },
          { key: 'seats', header: 'Seats', render: (c) => { const x = c as unknown as CourseItem; return `${x.enrolledCount}/${x.seats}`; } },
          { key: 'status', header: 'Status', render: (c) => { const x = c as unknown as CourseItem; return <AdminBadge tone={statusTone(x.status)}>{x.status}</AdminBadge>; } },
          { key: 'isFeatured', header: 'Featured', render: (c) => (c as unknown as CourseItem).isFeatured ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <span className="text-ink-300">—</span> },
          {
            key: 'actions', header: 'Actions', className: 'text-right',
            render: (c) => { const x = c as unknown as CourseItem; return (
              <div className="flex items-center justify-end gap-1">
                <IconBtn title="Edit" onClick={() => openEdit(x)}><Pencil className="h-4 w-4" /></IconBtn>
                <IconBtn title="Toggle Featured" onClick={() => toggleFeatured(x)}><Star className={`h-4 w-4 ${x.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-ink-400'}`} /></IconBtn>
                <IconBtn title={x.status === 'published' ? 'Archive' : 'Publish'} onClick={() => toggleStatus(x)}>
                  {x.status === 'published' ? <Archive className="h-4 w-4 text-amber-600" /> : <Upload className="h-4 w-4 text-emerald-600" />}
                </IconBtn>
                <IconBtn title="Delete" onClick={() => setDeleteCourse(x)}><Trash2 className="h-4 w-4 text-rose-500" /></IconBtn>
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
        title={editCourse ? 'Edit Course' : 'Create Course'}
        footer={
          <>
            <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100">Cancel</button>
            <AdminButton onClick={submitForm} disabled={busy}>{busy ? 'Saving...' : editCourse ? 'Save' : 'Create'}</AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" /></Field>
          <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="admin-input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="admin-input" /></Field>
            <Field label="Duration"><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 3 months" className="admin-input" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mode">
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="admin-input">
                {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Seats"><input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} className="admin-input" /></Field>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirm */}
      <AdminModal
        open={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        title="Delete Course"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteCourse(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100">Cancel</button>
            <button
              onClick={confirmDelete}
              disabled={busy}
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-rose-700 disabled:opacity-60"
            >
              {busy ? 'Processing...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-600">Delete &quot;{deleteCourse?.title}&quot;? This cannot be undone.</p>
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
