/**
 * Permail's merge-tag engine.
 *
 *   {{first_name}}              -> value, or "" when unknown
 *   {{company|your company}}    -> value, or the fallback after the pipe
 *
 * Field names are free-form: whatever columns the user adds to an audience
 * become valid tags, so the number of dynamic values is unlimited.
 */

const TOKEN_RE = /\{\{\s*([^{}|]+?)\s*(?:\|\s*([^{}]*?)\s*)?\}\}/g;

export type Row = Record<string, string>;

/** Every distinct field referenced by a piece of copy, in first-seen order. */
export function extractTokens(...sources: string[]): string[] {
  const seen = new Set<string>();
  for (const source of sources) {
    for (const match of (source ?? "").matchAll(TOKEN_RE)) {
      seen.add(match[1].trim());
    }
  }
  return [...seen];
}

/** Substitute every tag in `text` using `row`. */
export function render(text: string, row: Row): string {
  return (text ?? "").replace(TOKEN_RE, (_full, rawKey: string, fallback?: string) => {
    const key = rawKey.trim();
    const value = lookup(row, key);
    if (value !== undefined && value !== "") return value;
    return fallback ?? "";
  });
}

/** Case/spacing-tolerant lookup so `{{First Name}}` finds a `first_name` column. */
function lookup(row: Row, key: string): string | undefined {
  if (row[key] !== undefined) return row[key];
  const normal = normalize(key);
  for (const [k, v] of Object.entries(row)) {
    if (normalize(k) === normal) return v;
  }
  return undefined;
}

function normalize(key: string) {
  return key.toLowerCase().replace(/[\s_-]+/g, "");
}

/** Tags used in the copy that no column can fill — surfaced before sending. */
export function unknownTokens(sources: string[], fields: string[]): string[] {
  const known = new Set(fields.map(normalize));
  return extractTokens(...sources).filter((token) => !known.has(normalize(token)));
}

/** Rows whose tags would render empty — the "this will look broken" warning. */
export function rowsMissingValues(
  sources: string[],
  rows: Row[],
): { index: number; missing: string[] }[] {
  const tokensWithoutFallback = new Set<string>();
  for (const source of sources) {
    for (const match of (source ?? "").matchAll(TOKEN_RE)) {
      if (match[2] === undefined) tokensWithoutFallback.add(match[1].trim());
    }
  }

  const result: { index: number; missing: string[] }[] = [];
  rows.forEach((row, index) => {
    const missing = [...tokensWithoutFallback].filter((token) => {
      const value = lookup(row, token);
      return value === undefined || value.trim() === "";
    });
    if (missing.length) result.push({ index, missing });
  });
  return result;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((value ?? "").trim());
}

/** Turn a column label into a tag-safe key: "First Name" -> "first_name". */
export function toFieldKey(label: string): string {
  return (label ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}
