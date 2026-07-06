export function sanitizeText(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
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
