import { type InputHTMLAttributes, type ReactNode, forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
  hint?: string;
};

/**
 * Reusable text input matching KaamLok's design system.
 * Used across all auth forms.
 */
export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, icon, hint, className = '', id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-2xl border bg-ink-50/60 py-3.5 text-sm font-medium text-ink-800 transition-colors placeholder:text-ink-400 focus:outline-none focus:ring-2 ${
              icon ? 'pl-11 pr-4' : 'px-4'
            } ${
              error
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-ink-200 focus:border-brand-400 focus:bg-white focus:ring-brand-100'
            } ${className}`}
            {...rest}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs font-medium text-ink-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

/**
 * Password input with show/hide toggle.
 */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<Props, 'type'>>(
  ({ label, error, icon, hint, className = '', id, ...rest }, ref) => {
    const [show, setShow] = useState(false);
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={show ? 'text' : 'password'}
            className={`w-full rounded-2xl border bg-ink-50/60 py-3.5 text-sm font-medium text-ink-800 transition-colors placeholder:text-ink-400 focus:outline-none focus:ring-2 ${
              icon ? 'pl-11 pr-11' : 'pl-4 pr-11'
            } ${
              error
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-ink-200 focus:border-brand-400 focus:bg-white focus:ring-brand-100'
            } ${className}`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600"
          >
            {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs font-medium text-ink-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
