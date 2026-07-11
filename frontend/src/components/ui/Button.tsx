import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'white' | 'amber';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
  full?: boolean;
  loading?: boolean;
};

const base =
  'group relative inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2.5',
  md: 'text-sm px-5 py-3',
  lg: 'text-base px-7 py-3.5',
};

const variants: Record<Variant, string> = {
  primary:
    'text-white bg-brand-600 hover:bg-brand-700 shadow-soft hover:shadow-float hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-100 hover:-translate-y-0.5',
  ghost: 'text-ink-700 hover:text-brand-700 hover:bg-ink-100',
  white:
    'text-brand-700 bg-white hover:bg-ink-50 shadow-soft hover:shadow-float hover:-translate-y-0.5 border border-ink-200/60',
  amber:
    'text-amber-700 bg-amber-400 hover:bg-amber-500 shadow-soft hover:shadow-float hover:-translate-y-0.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconRight,
  full,
  loading = false,
  disabled,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {iconRight && (
        <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
          {iconRight}
        </span>
      )}
    </button>
  );
}
