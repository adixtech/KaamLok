import { type ReactNode } from 'react';
import { Check } from 'lucide-react';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  error?: string;
  id?: string;
};

/**
 * Accessible checkbox with custom KaamLok styling and a focus ring.
 */
export function Checkbox({ checked, onChange, label, error, id }: Props) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <span
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all ${
            checked
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-ink-300 bg-white hover:border-brand-400'
          }`}
        >
          {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span className="text-sm leading-relaxed text-ink-600">{label}</span>
      </label>
      {error && <p className="mt-1.5 pl-8 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
