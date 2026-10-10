import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_DELIMITER, parseDelimitedList, sameList } from '../../utils/delimitedList';

type CommaSeparatedInputProps = {
  /** Current value held by the parent (parsed array). */
  value?: string[];
  /** Called with the parsed array on every keystroke. */
  onChange: (next: string[]) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  delimiter?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  disabled?: boolean;
};

/**
 * Text input for lists of short values (tags, skills, hiring partners, ...).
 *
 * Why this exists instead of `<input value={value.join(', ')} onChange={split} />`:
 * that pattern deletes the delimiter the instant it is typed. Typing "Python, SQL"
 * produces "Python" -> typing "," re-parses to ["Python"] -> the comma is erased
 * from the rendered value -> the next character appends to "Python", collapsing
 * the whole entry into a single item ("Python SQL").
 *
 * This component keeps the raw text the user typed as the source of truth for
 * rendering, and only converts it to an array for the parent. The raw text is
 * resynchronised from the array only when the array changes independently
 * (e.g. a course is loaded for editing, or the form is reset).
 */
export function CommaSeparatedInput({
  value,
  onChange,
  label,
  placeholder,
  hint,
  error,
  delimiter = DEFAULT_DELIMITER,
  className = '',
  inputClassName = '',
  id,
  disabled = false,
}: CommaSeparatedInputProps) {
  const [text, setText] = useState(() => (value ?? []).join(`${delimiter} `));
  // Mirrors `text` for use inside effects and event handlers. It is written
  // only in those places, never during render.
  const textRef = useRef(text);

  // Resync only when the incoming array disagrees with what the current text
  // parses to. Otherwise every keystroke would fight the user's cursor.
  useEffect(() => {
    const incoming = value ?? [];
    if (!sameList(incoming, parseDelimitedList(textRef.current, delimiter))) {
      const next = incoming.join(`${delimiter} `);
      setText(next);
      textRef.current = next;
    }
  }, [value, delimiter]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setText(next);
      textRef.current = next;
      onChange(parseDelimitedList(next, delimiter));
    },
    [delimiter, onChange]
  );

  // Enter commits the current entry instead of submitting the surrounding form.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const current = textRef.current;
      if (parseDelimitedList(current, delimiter).length === 0) return;
      const next = `${current}${delimiter} `;
      setText(next);
      textRef.current = next;
      onChange(parseDelimitedList(next, delimiter));
    },
    [delimiter, onChange]
  );

  const count = parseDelimitedList(text, delimiter).length;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Trim trailing delimiters/spaces once the field loses focus.
          const normalised = parseDelimitedList(textRef.current, delimiter).join(`${delimiter} `);
          if (normalised !== textRef.current) {
            setText(normalised);
            textRef.current = normalised;
            onChange(parseDelimitedList(normalised, delimiter));
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-2xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-rose-300' : ''
        } ${inputClassName}`}
      />
      <div className="mt-1 flex items-start justify-between gap-3">
        <div>
          {error ? (
            <p className="text-xs text-rose-600">{error}</p>
          ) : hint ? (
            <p className="text-xs text-ink-400">{hint}</p>
          ) : null}
        </div>
        {count > 0 && <p className="shrink-0 text-xs text-ink-400">{count} added</p>}
      </div>
    </div>
  );
}
