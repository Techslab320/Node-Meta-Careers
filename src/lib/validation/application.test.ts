import { describe, expect, it } from "vitest";
import {
  applicationFormSchema,
  applicationSchema,
  normalizeTelegram,
  validateResumeFile,
} from "@/lib/validation/application";

const optionalDefaults = {
  portfolioUrl: "",
  telegramUsername: "",
  discordUsername: "",
  referralSource: "",
  additionalMessage: "",
};

const baseApplication = {
  jobId: "507f1f77bcf86cd799439011",
  jobSlug: "web3-engineer",
  firstName: "Alex",
  lastName: "Rivera",
  email: "alex@example.com",
  country: "United States",
  city: "Austin",
  linkedinUrl: "https://linkedin.com/in/alexrivera",
  githubUrl: "https://github.com/alexrivera",
  yearsOfExperience: 5,
  currentJobTitle: "Software Engineer",
  professionalSummary:
    "Blockchain engineer with experience building secure dApps and backend services.",
  motivation:
    "I want to join Node Meta because the team builds practical Web3 infrastructure.",
  earliestStartDate: "2026-08-01",
  salaryExpectation: "USD 140000",
  preferredEmploymentType: "full-time" as const,
  preferredExperienceLevel: "mid-level" as const,
  workAuthorization: "Authorized to work remotely",
  resumeUrl: "https://example.com/resume.pdf",
  resumeFilename: "resume.pdf",
  consentAccepted: true,
  website: "",
  ...optionalDefaults,
};

describe("applicationFormSchema", () => {
  const baseForm = {
    jobId: "507f1f77bcf86cd799439011",
    jobSlug: "web3-engineer",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex@example.com",
    country: "United States",
    linkedinUrl: "https://linkedin.com/in/alexrivera",
    githubUrl: "https://github.com/alexrivera",
    yearsOfExperience: 5,
    currentJobTitle: "",
    professionalSummary:
      "Blockchain engineer with experience building secure dApps and backend services.",
    motivation:
      "I want to join Node Meta because the team builds practical Web3 infrastructure.",
    earliestStartDate: "2026-08-01",
    salaryExpectation: "USD 140000",
    preferredEmploymentType: "full-time" as const,
    preferredExperienceLevel: "mid-level" as const,
    workAuthorization: "Authorized to work remotely",
    consentAccepted: true,
    website: "",
    ...optionalDefaults,
  };

  it("accepts valid form input without resume fields", () => {
    const result = applicationFormSchema.safeParse(baseForm);
    expect(result.success).toBe(true);
  });

  it("ignores invalid optional URL and social fields", () => {
    const result = applicationFormSchema.safeParse({
      ...baseForm,
      portfolioUrl: "I don't have",
      githubUrl: "n/a",
      telegramUsername: "bad telegram",
      discordUsername: "not needed",
      referralSource: "friend",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.portfolioUrl).toBe("");
      expect(result.data.githubUrl).toBe("");
      expect(result.data.telegramUsername).toBe("");
      expect(result.data.discordUsername).toBe("not needed");
    }
  });

  it("accepts empty or undefined optional fields", () => {
    const result = applicationFormSchema.safeParse({
      ...baseForm,
      city: undefined,
      portfolioUrl: undefined,
      telegramUsername: undefined,
      discordUsername: undefined,
      referralSource: undefined,
      additionalMessage: undefined,
      currentJobTitle: undefined,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.city).toBe("");
      expect(result.data.portfolioUrl).toBe("");
      expect(result.data.discordUsername).toBe("");
    }
  });

  it("accepts any text in optional free-text fields", () => {
    const result = applicationFormSchema.safeParse({
      ...baseForm,
      discordUsername: "!!!",
      referralSource: "123",
      additionalMessage: "...",
      currentJobTitle: "-",
    });

    expect(result.success).toBe(true);
  });
});

describe("applicationSchema", () => {
  it("accepts valid application input", () => {
    const result = applicationSchema.safeParse(baseApplication);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    const result = applicationSchema.safeParse({
      ...baseApplication,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects submissions without consent", () => {
    const result = applicationSchema.safeParse({
      ...baseApplication,
      consentAccepted: false,
    });
    expect(result.success).toBe(false);
  });

  it("ignores invalid optional URL and social fields", () => {
    const result = applicationSchema.safeParse({
      ...baseApplication,
      portfolioUrl: "I don't have",
      githubUrl: "n/a",
      telegramUsername: "bad telegram",
      discordUsername: "not needed",
      referralSource: "friend",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.portfolioUrl).toBe("");
      expect(result.data.githubUrl).toBe("");
      expect(result.data.telegramUsername).toBe("");
      expect(result.data.discordUsername).toBe("not needed");
    }
  });

  it("accepts valid optional URLs and telegram usernames", () => {
    expect(
      applicationSchema.safeParse({
        ...baseApplication,
        portfolioUrl: "https://portfolio.example.com",
        telegramUsername: "@valid_user",
      }).success,
    ).toBe(true);

    expect(
      applicationSchema.safeParse({
        ...baseApplication,
        telegramUsername: "https://t.me/valid_user",
      }).success,
    ).toBe(true);
  });
});

describe("normalizeTelegram", () => {
  it("normalizes t.me links to @username", () => {
    expect(normalizeTelegram("https://t.me/node_meta")).toBe("@node_meta");
  });
});

describe("validateResumeFile", () => {
  it("accepts valid PDF resumes", () => {
    const file = new File(["resume"], "resume.pdf", {
      type: "application/pdf",
    });
    expect(validateResumeFile(file)).toBeNull();
  });

  it("rejects unsupported file types", () => {
    const file = new File(["resume"], "resume.exe", {
      type: "application/octet-stream",
    });
    expect(validateResumeFile(file)).toBeTruthy();
  });

  it("rejects files larger than 10 MB", () => {
    const largeContent = new Uint8Array(10 * 1024 * 1024 + 1);
    const file = new File([largeContent], "resume.pdf", {
      type: "application/pdf",
    });
    expect(validateResumeFile(file)).toContain("10 MB");
  });
});
