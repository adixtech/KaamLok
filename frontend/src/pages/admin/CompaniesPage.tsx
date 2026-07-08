import {
  Building2, BarChart3, FileText, Briefcase, DollarSign,
  FileCheck, ShieldCheck, Sparkles,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

type Card = {
  title: string;
  desc: string;
  icon: typeof Building2;
  tone: string;
};

const CARDS: Card[] = [
  { title: 'Company List', desc: 'Manage CSR partner companies and their profiles', icon: Building2, tone: 'bg-brand-50 text-brand-600' },
  { title: 'CSR Dashboard', desc: 'Overview of CSR activities and partnerships', icon: BarChart3, tone: 'bg-teal-50 text-teal-600' },
  { title: 'CSR Analytics', desc: 'Funding trends and impact metrics', icon: BarChart3, tone: 'bg-amber-50 text-amber-600' },
  { title: 'Projects', desc: 'CSR-funded projects and their progress', icon: Briefcase, tone: 'bg-emerald-50 text-emerald-600' },
  { title: 'Funding', desc: 'Track funding allocations and disbursements', icon: DollarSign, tone: 'bg-brand-50 text-brand-600' },
  { title: 'Documents', desc: 'CSR compliance documents and certificates', icon: FileText, tone: 'bg-teal-50 text-teal-600' },
  { title: 'Verification', desc: 'Verify CSR companies and their credentials', icon: ShieldCheck, tone: 'bg-rose-50 text-rose-600' },
  { title: 'Compliance', desc: 'Regulatory compliance tracking and reporting', icon: FileCheck, tone: 'bg-amber-50 text-amber-600' },
];

export function CompaniesPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">CSR Companies</h1>
        <p className="mt-1 text-sm text-ink-500">Corporate Social Responsibility partner management</p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50 p-5 ring-1 ring-inset ring-brand-100">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-card">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-ink-900">Future-Ready Module</h2>
          <p className="mt-1 text-sm text-ink-600">
            The CSR Company module architecture is in place. This feature will enable partnerships with
            corporations for funding courses, tracking CSR spend compliance, and measuring social impact.
            Data will appear here once the module is activated.
          </p>
        </div>
      </div>

      {/* Coming Soon Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="relative flex flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-base font-bold text-ink-900">{card.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{card.desc}</p>
              <div className="mt-4 border-t border-ink-50 pt-3">
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                  Architecture ready
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
