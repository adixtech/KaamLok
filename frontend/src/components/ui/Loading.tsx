import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Full-screen spinner for route-level loading states.
 */
export function FullScreenLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}

/**
 * Inline spinner for buttons and small areas.
 */
export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
}

/**
 * Skeleton block for content loading.
 */
export function Skeleton({ className = '', children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-ink-200/60 ${className}`}>{children}</div>
  );
}
