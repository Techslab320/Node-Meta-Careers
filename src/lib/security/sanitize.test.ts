import { describe, expect, it } from "vitest";
import { sanitizeText } from "@/lib/security/sanitize";

describe("sanitizeText", () => {
  it("removes HTML tags from input", () => {
    expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe("Hello");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  Node Meta  ")).toBe("Node Meta");
  });
});
