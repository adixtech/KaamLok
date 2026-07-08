import { type ReactNode, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  icon?: ReactNode;
  full?: boolean;
};

const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-sm px-6 py-3',
};

const variants: Record<Variant, string> = {
  primary: 'text-white bg-brand-600 hover:bg-brand-700 shadow-soft',
  secondary: 'text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-100',
  ghost: 'text-ink-600 hover:text-brand-700 hover:bg-ink-100',
  danger: 'text-white bg-rose-600 hover:bg-rose-700 shadow-soft',
  success: 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-soft',
};

export function AdminButton({ variant = 'primary', size = 'md', children, icon, full, className = '', ...rest }: Props) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
