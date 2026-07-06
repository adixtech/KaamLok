import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';

type Props = {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
};

/**
 * Accessible OTP input with 6 boxes, auto-advance, paste support, and backspace nav.
 */
export function OTPInput({ length = 6, value, onChange, disabled, error }: Props) {
  const [digits, setDigits] = useState<string[]>(() =>
    value.split('').concat(Array(length).fill('')).slice(0, length)
  );
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setDigits(value.split('').concat(Array(length).fill('')).slice(0, length));
  }, [value, length]);

  const emit = (next: string[]) => {
    onChange(next.join(''));
  };

  const handleChange = (i: number, raw: string) => {
    const ch = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    emit(next);
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = pasted.split('').concat(Array(length).fill('')).slice(0, length);
    setDigits(next);
    emit(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`OTP digit ${i + 1}`}
          className={`h-12 w-11 rounded-2xl border bg-white text-center text-lg font-bold text-ink-900 transition-all focus:outline-none focus:ring-2 sm:h-14 sm:w-12 ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
              : 'border-ink-200 focus:border-brand-400 focus:ring-brand-100'
          } disabled:opacity-60`}
        />
      ))}
    </div>
  );
}
