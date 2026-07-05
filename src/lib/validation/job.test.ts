import { describe, expect, it } from "vitest";
import { jobSchema } from "@/lib/validation/job";

const validJob = {
  title: "Senior Blockchain Engineer",
  slug: "senior-blockchain-engineer",
  department: "Engineering",
  location: "Remote",
  remoteType: "remote",
  employmentType: "full-time",
  experienceLevel: "senior",
  summary: "Build secure blockchain infrastructure for Node Meta products and services.",
  overview:
    "Join the engineering team to design, implement, and operate scalable Web3 systems across the Node Meta ecosystem.",
  responsibilities: ["Design APIs", "Review smart contracts"],
  requiredQualifications: ["5+ years backend experience"],
  preferredQualifications: ["BNB Smart Chain experience"],
  technologies: ["TypeScript", "Solidity"],
  benefits: ["Remote work"],
  status: "draft",
  featured: false,
};

describe("jobSchema", () => {
  it("accepts valid job input", () => {
    const result = jobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug format", () => {
    const result = jobSchema.safeParse({
      ...validJob,
      slug: "Invalid Slug!",
    });
    expect(result.success).toBe(false);
  });

  it("parses multiline list fields from strings", () => {
    const result = jobSchema.safeParse({
      ...validJob,
      responsibilities: "Own architecture\nWrite tests",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.responsibilities).toEqual([
        "Own architecture",
        "Write tests",
      ]);
    }
  });

  it("rejects summaries that are too short", () => {
    const result = jobSchema.safeParse({
      ...validJob,
      summary: "Too short",
    });
    expect(result.success).toBe(false);
  });
});
