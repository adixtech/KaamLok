/**
 * Payload normalisation helpers.
 *
 * The course editor accepts comma-separated text for list fields (tags, skills,
 * documents, hiring partners, ...). Mongoose silently coerces a raw string into a
 * single-element array, so "Python, SQL" would persist as one literal tag
 * "Python, SQL" instead of two tags. Normalising on the way in makes the API
 * tolerant of both shapes (array or delimited string) regardless of client.
 */

const DEFAULT_DELIMITERS = [',', '\n'];

/**
 * Coerce an unknown value into a clean string[].
 *
 * Accepts an array, a delimited string ("a, b" / "a\nb"), a scalar, or nothing.
 * Entries are trimmed, empties dropped, and case-insensitive duplicates removed
 * (first occurrence wins). Existing arrays are deduplicated but otherwise kept
 * in order, so already-correct payloads are never reordered.
 */
export function toStringArray(input: unknown, delimiters: string[] = DEFAULT_DELIMITERS): string[] {
  if (input === null || input === undefined) return [];

  let candidates: unknown[];
  if (Array.isArray(input)) {
    candidates = input;
  } else if (typeof input === 'string') {
    const pattern = delimiters.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    candidates = input.split(new RegExp(pattern));
  } else if (typeof input === 'number' || typeof input === 'boolean') {
    candidates = [input];
  } else {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];
  for (const candidate of candidates) {
    const value = String(candidate ?? '').trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

/** Nested list fields on the Course schema that arrive as delimited strings. */
const LIST_PATHS: Array<{ path: string[]; key: string }> = [
  { path: [], key: 'tags' },
  { path: [], key: 'benefits' },
  { path: [], key: 'recognition' },
  { path: ['schedule'], key: 'trainingDays' },
  { path: ['eligibility'], key: 'requiredSkills' },
  { path: ['eligibility'], key: 'preferredSkills' },
  { path: ['eligibility'], key: 'requiredDocuments' },
  { path: ['eligibility'], key: 'customDocuments' },
  { path: ['placement'], key: 'hiringPartners' },
];

/**
 * Return a copy of `payload` where every known list field is a real string[].
 * Non-list fields are untouched. The original object is never mutated.
 */
export function normalizeCourseLists<T extends Record<string, unknown>>(payload: T): T {
  const result: Record<string, unknown> = { ...payload };

  for (const { path, key } of LIST_PATHS) {
    if (path.length === 0) {
      if (result[key] !== undefined) result[key] = toStringArray(result[key]);
      continue;
    }

    const parentKey = path[0];
    const parent = result[parentKey];
    if (!parent || typeof parent !== 'object' || Array.isArray(parent)) continue;
    const parentRecord = parent as Record<string, unknown>;
    if (parentRecord[key] === undefined) continue;

    result[parentKey] = {
      ...parentRecord,
      [key]: toStringArray(parentRecord[key]),
    };
  }

  return result as T;
}
