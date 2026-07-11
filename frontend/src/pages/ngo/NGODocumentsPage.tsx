import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  FileText, Upload, AlertCircle, CheckCircle2, XCircle, Clock,
  Eye, Download, Trash2, Plus, X, Calendar,
  Shield, FileCheck,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { ngoApi } from '../../services/ngoApi';
import type { NGOProfile, NGODocument, DocumentType } from '../../types/ngo';
import { DOCUMENT_TYPE_LABELS } from '../../types/ngo';
import { FullScreenLoader } from '../../components/ui/Loading';
import toast from 'react-hot-toast';

export function NGODocumentsPage() {
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ngoApi.getProfile();
      setProfile(res.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchProfile();
    toast.success('Document uploaded successfully');
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await ngoApi.deleteDocument(docId);
      fetchProfile();
      toast.success('Document deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const documents = profile?.documents || [];

  const stats = {
    total: documents.length,
    verified: documents.filter((d) => d.status === 'verified').length,
    pending: documents.filter((d) => d.status === 'pending').length,
    rejected: documents.filter((d) => d.status === 'rejected').length,
  };

  const requiredDocs: DocumentType[] = ['registration', '80g', '12a', 'csr', 'government_approval'];
  const uploadedTypes = new Set(documents.map((d) => d.type));
  const missingDocsCount = requiredDocs.filter((t) => !uploadedTypes.has(t)).length;

  return (
    <NGOLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Documents</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your organization's verification documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard icon={<FileText className="h-5 w-5" />} label="Total" value={stats.total} tone="bg-ink-100 text-ink-600" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Verified" value={stats.verified} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending" value={stats.pending} tone="bg-amber-50 text-amber-600" />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejected" value={stats.rejected} tone="bg-rose-50 text-rose-600" />
      </div>

      {/* Missing Documents Alert */}
      {missingDocsCount > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Missing Required Documents</p>
            <p className="mt-1 text-sm text-amber-700">
              Upload the following documents to complete verification: {' '}
              {requiredDocs
                .filter((t) => !uploadedTypes.has(t))
                .map((t) => DOCUMENT_TYPE_LABELS[t])
                .join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <FullScreenLoader label="Loading documents..." />
      ) : error ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h3 className="mt-4 text-lg font-bold text-ink-900">{error}</h3>
          <button
            onClick={fetchProfile}
            className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
          <FileText className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-lg font-bold text-ink-900">No Documents Uploaded</h3>
          <p className="mt-1 text-sm text-ink-500">
            Upload your organization's registration, 80G, 12A, and other verification documents.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Upload className="h-4 w-4" />
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id || doc.url}
              document={doc}
              onDelete={() => doc._id && handleDelete(doc._id)}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          existingTypes={uploadedTypes}
        />
      )}
    </NGOLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <div>
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="text-xl font-bold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function DocumentCard({
  document,
  onDelete,
}: {
  document: NGODocument;
  onDelete: () => void;
}) {
  const statusConfig = {
    pending: { icon: <Clock className="h-4 w-4" />, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending Verification' },
    verified: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Verified' },
    rejected: { icon: <XCircle className="h-4 w-4" />, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Rejected' },
  };

  const status = statusConfig[document.status];
  const uploadedDate = document.uploadedAt ? new Date(document.uploadedAt) : null;
  const verifiedDate = document.verifiedAt ? new Date(document.verifiedAt) : null;

  const typeIcon = {
    registration: <Shield className="h-5 w-5" />,
    '80g': <FileCheck className="h-5 w-5" />,
    '12a': <FileCheck className="h-5 w-5" />,
    csr: <FileText className="h-5 w-5" />,
    government_approval: <Shield className="h-5 w-5" />,
    other: <FileText className="h-5 w-5" />,
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className={`grid h-12 w-12 place-items-center rounded-xl ${
            document.status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
            document.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
            'bg-amber-50 text-amber-600'
          }`}>
            {typeIcon[document.type]}
          </span>
          <div>
            <p className="font-semibold text-ink-900">{DOCUMENT_TYPE_LABELS[document.type]}</p>
            <p className="text-sm text-ink-500">{document.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}>
            {status.icon}
            {status.label}
          </span>
        </div>
      </div>

      {/* Document Details */}
      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2 text-ink-500">
          <Calendar className="h-4 w-4" />
          <span>Uploaded: {uploadedDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || '-'}</span>
        </div>
        {verifiedDate && (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Verified: {verifiedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Rejection Note */}
      {document.status === 'rejected' && document.note && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <p className="text-xs font-medium uppercase text-rose-600">Rejection Reason</p>
          <p className="mt-1 text-sm text-rose-900">{document.note}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </a>
        <a
          href={document.url}
          download
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

function UploadDocumentModal({
  onClose,
  onSuccess,
  existingTypes,
}: {
  onClose: () => void;
  onSuccess: () => void;
  existingTypes: Set<DocumentType>;
}) {
  const [formData, setFormData] = useState({
    type: 'registration' as DocumentType,
    name: '',
    url: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableTypes = Object.entries(DOCUMENT_TYPE_LABELS)
    .filter(([key]) => !existingTypes.has(key as DocumentType) || key === 'other')
    .map(([value, name]) => ({ value, name }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.type) errs.type = 'Document type required';
    if (!formData.name.trim()) errs.name = 'Document name required';
    if (!formData.url.trim()) errs.url = 'Document URL required';
    else if (!/^https?:\/\/.+/.test(formData.url)) errs.url = 'Enter a valid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await ngoApi.uploadDocument(formData);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-float">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Upload Document</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Document Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value as DocumentType }))}
              className={`mt-1 w-full rounded-xl border ${errors.type ? 'border-rose-300' : 'border-ink-200'} bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
            >
              {availableTypes.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.name}</option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-xs text-rose-600">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700">Document Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Registration Certificate 2024"
              className={`mt-1 w-full rounded-xl border ${errors.name ? 'border-rose-300' : 'border-ink-200'} px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700">Document URL *</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://drive.google.com/file/d/..."
              className={`mt-1 w-full rounded-xl border ${errors.url ? 'border-rose-300' : 'border-ink-200'} px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.url && <p className="mt-1 text-xs text-rose-600">{errors.url}</p>}
            <p className="mt-2 text-xs text-ink-500">
              Upload your document to Google Drive, Dropbox, or any cloud storage and paste the shareable link here.
            </p>
          </div>

          <div className="mt-2 rounded-xl border border-teal-200 bg-teal-50 p-3">
            <p className="text-xs font-medium text-teal-700">Future Integration</p>
            <p className="mt-1 text-xs text-teal-600">
              Direct file upload to cloud storage (AWS S3) will be available soon. For now, use a cloud storage link.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NGODocumentsPage;
