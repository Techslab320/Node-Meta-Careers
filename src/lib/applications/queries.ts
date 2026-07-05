import { getEnv } from "@/config/env";
import { connectDB } from "@/lib/database/mongodb";
import { ApplicationModel } from "@/models/Application";
import type { AdminApplicationFilters, ApplicationDocument } from "@/types";

function serializeApplication(
  application: InstanceType<typeof ApplicationModel>,
): ApplicationDocument {
  return {
    _id: application._id.toString(),
    jobId: application.jobId.toString(),
    jobTitle: application.jobTitle,
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.email,
    country: application.country,
    city: application.city ?? undefined,
    linkedinUrl: application.linkedinUrl ?? undefined,
    githubUrl: application.githubUrl ?? undefined,
    portfolioUrl: application.portfolioUrl ?? undefined,
    telegramUsername: application.telegramUsername ?? undefined,
    discordUsername: application.discordUsername ?? undefined,
    currentJobTitle: application.currentJobTitle ?? undefined,
    yearsOfExperience: application.yearsOfExperience ?? undefined,
    professionalSummary: application.professionalSummary,
    motivation: application.motivation,
    earliestStartDate: application.earliestStartDate ?? undefined,
    salaryExpectation: application.salaryExpectation ?? undefined,
    preferredEmploymentType: application.preferredEmploymentType ?? undefined,
    preferredExperienceLevel: application.preferredExperienceLevel ?? undefined,
    workAuthorization: application.workAuthorization ?? undefined,
    referralSource: application.referralSource ?? undefined,
    additionalMessage: application.additionalMessage ?? undefined,
    resumeUrl: application.resumeUrl,
    resumeFilename: application.resumeFilename,
    status: application.status,
    recruiterNotes: application.recruiterNotes ?? undefined,
    consentAccepted: application.consentAccepted,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  };
}

export async function hasRecentDuplicateApplication(
  email: string,
  jobId: string,
): Promise<boolean> {
  await connectDB();
  const env = getEnv();
  const hours = env.DUPLICATE_APPLICATION_HOURS ?? 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const existing = await ApplicationModel.findOne({
    email: email.toLowerCase(),
    jobId,
    createdAt: { $gte: since },
  }).select("_id");

  return Boolean(existing);
}

export async function getApplications(filters: AdminApplicationFilters = {}) {
  await connectDB();
  const query: Record<string, unknown> = {};

  if (filters.jobId) query.jobId = filters.jobId;
  if (filters.status) query.status = filters.status;
  if (filters.country) query.country = new RegExp(filters.country, "i");

  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      (query.createdAt as Record<string, Date>).$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      (query.createdAt as Record<string, Date>).$lte = new Date(filters.dateTo);
    }
  }

  if (filters.search) {
    query.$or = [
      { firstName: new RegExp(filters.search, "i") },
      { lastName: new RegExp(filters.search, "i") },
      { email: new RegExp(filters.search, "i") },
      { jobTitle: new RegExp(filters.search, "i") },
    ];
  }

  const applications = await ApplicationModel.find(query).sort({ createdAt: -1 });
  return applications.map(serializeApplication);
}

export async function getApplicationById(id: string) {
  await connectDB();
  const application = await ApplicationModel.findById(id);
  return application ? serializeApplication(application) : null;
}

export async function deleteApplicationById(id: string): Promise<boolean> {
  await connectDB();

  const application = await ApplicationModel.findById(id);
  if (!application) return false;

  const { ChatRoomSessionModel } = await import("@/models/ChatRoomSession");
  await ChatRoomSessionModel.deleteMany({ applicationId: application._id });
  await ApplicationModel.findByIdAndDelete(id);

  return true;
}

export async function getApplicationStats() {
  await connectDB();
  const [total, newCount, byStatus] = await Promise.all([
    ApplicationModel.countDocuments(),
    ApplicationModel.countDocuments({ status: "new" }),
    ApplicationModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  return {
    total,
    newCount,
    byStatus: Object.fromEntries(
      byStatus.map((item: { _id: string; count: number }) => [
        item._id,
        item.count,
      ]),
    ) as Record<string, number>,
  };
}
