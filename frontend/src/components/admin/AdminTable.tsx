import { type ReactNode, useMemo } from 'react';

type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  rowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
};

export function AdminTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyMessage = 'No data found',
  rowKey,
  onRowClick,
}: Props<T>) {
  const skeletonRows = useMemo(() => Array.from({ length: 5 }), []);

  return (
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-ink-200/50">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {loading ? (
            skeletonRows.map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <div className="h-4 animate-pulse rounded-lg bg-ink-200/60" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-ink-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={rowKey(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-ink-50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3.5 text-sm text-ink-700 ${col.className || ''}`}>
                    {col.render ? col.render(item) : (item[col.key] as ReactNode) || '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
