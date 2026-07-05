import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { applicationStatuses, employmentTypes, experienceLevels } from "@/config/site";
import { mongoCollections } from "@/config/database";

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    jobTitle: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    telegramUsername: { type: String, trim: true },
    discordUsername: { type: String, trim: true },
    currentJobTitle: { type: String, trim: true },
    yearsOfExperience: { type: Number },
    professionalSummary: { type: String, required: true, trim: true },
    motivation: { type: String, required: true, trim: true },
    earliestStartDate: { type: String, trim: true },
    salaryExpectation: { type: String, trim: true },
    preferredEmploymentType: {
      type: String,
      enum: employmentTypes,
    },
    preferredExperienceLevel: {
      type: String,
      enum: experienceLevels,
    },
    workAuthorization: { type: String, trim: true },
    referralSource: { type: String, trim: true },
    additionalMessage: { type: String, trim: true },
    resumeUrl: { type: String, required: true },
    resumeFilename: { type: String, required: true },
    status: {
      type: String,
      enum: applicationStatuses,
      default: "new",
    },
    recruiterNotes: { type: String, trim: true },
    consentAccepted: { type: Boolean, required: true },
  },
  { timestamps: true },
);

applicationSchema.index({ email: 1, jobId: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ country: 1 });

export type Application = InferSchemaType<typeof applicationSchema>;

export const ApplicationModel: Model<Application> =
  mongoose.models.Application ??
  mongoose.model<Application>("Application", applicationSchema, mongoCollections.applications);
