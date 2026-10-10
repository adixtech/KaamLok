export const DEFAULT_DELIMITER = ',';

/**
 * Parses a delimiter-separated string into a clean string array.
 *
 * - trims each entry
 * - drops empty entries (so a trailing "," while typing is not an error)
 * - removes case-insensitive duplicates, keeping the first occurrence
 *
 * Accepts arrays too, so callers can safely pass an already-parsed value.
 */
export function parseDelimitedList(input: unknown, delimiter = DEFAULT_DELIMITER): string[] {
  if (Array.isArray(input)) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of input) {
      const value = String(raw ?? '').trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(value);
    }
    return out;
  }

  if (input === null || input === undefined) return [];

  return parseDelimitedList(String(input).split(delimiter), delimiter);
}

/** Shallow equality for two parsed lists, used to detect external changes. */
export function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item, i) => item === b[i]);
}