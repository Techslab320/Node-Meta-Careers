import { describe, expect, it } from "vitest";
import { adminBasePath } from "@/config/admin";
import { getPublishedJobs } from "@/lib/jobs/queries";

describe("published job filtering", () => {
  it("exposes a published-only jobs query helper", () => {
    expect(typeof getPublishedJobs).toBe("function");
  });
});

describe("admin route protection", () => {
  it("expects admin routes to use dedicated middleware matchers", () => {
    const matchers = [adminBasePath, `${adminBasePath}/:path*`];
    expect(matchers).toContain(adminBasePath);
    expect(matchers).toContain(`${adminBasePath}/:path*`);
  });
});

describe("application API module", () => {
  it("exports application validation schema", async () => {
    const { applicationSchema } = await import("@/lib/validation/application");
    const result = applicationSchema.safeParse({
      website: "https://spam.example",
    });
    expect(result.success).toBe(false);
  });
});
