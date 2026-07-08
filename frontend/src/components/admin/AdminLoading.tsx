import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/** Full-screen loader for admin route-level loading. */
export function AdminLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}

/** Inline spinner for buttons. */
export function AdminSpinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
}

/** Skeleton block for content loading. */
export function AdminSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-ink-200/60 ${className}`} />;
}

/** Empty state placeholder. */
export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">{icon}</span>
      <h3 className="mt-4 text-lg font-bold text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
    </div>
  );
}

/** Error state placeholder. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink-900">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Try again
        </button>
      )}
    </div>
  );
}
