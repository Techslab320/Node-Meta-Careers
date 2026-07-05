import DOMPurify from "isomorphic-dompurify";

export function sanitizeText(value: string): string {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .trim()
    .replace(/\0/g, "");
}

export function sanitizeOptionalText(value?: string | null): string | undefined {
  if (value == null || value === "") return undefined;
  return sanitizeText(value);
}

export function sanitizeRecord<T extends Record<string, unknown>>(
  data: T,
  textFields: (keyof T)[],
): T {
  const result = { ...data };
  for (const field of textFields) {
    const value = result[field];
    if (typeof value === "string") {
      result[field] = sanitizeText(value) as T[keyof T];
    }
  }
  return result;
}
