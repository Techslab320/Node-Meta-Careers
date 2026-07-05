import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import {
  employmentTypes,
  experienceLevels,
  jobStatuses,
  remoteTypes,
} from "@/config/site";
import { mongoCollections } from "@/config/database";

const compensationBandSchema = new Schema(
  {
    employmentType: {
      type: String,
      enum: employmentTypes,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: experienceLevels,
      required: true,
    },
    salaryMin: { type: Number, required: true },
    salaryMax: { type: Number, required: true },
    salaryCurrency: { type: String, default: "USD", trim: true },
    salaryPeriod: {
      type: String,
      enum: ["hour", "month", "year"],
      required: true,
    },
  },
  { _id: false },
);

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    remoteType: {
      type: String,
      enum: remoteTypes,
      required: true,
    },
    employmentType: {
      type: String,
      enum: employmentTypes,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: experienceLevels,
      required: true,
    },
    compensationBands: {
      type: [compensationBandSchema],
      default: [],
    },
    summary: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    responsibilities: { type: [String], default: [] },
    requiredQualifications: { type: [String], default: [] },
    preferredQualifications: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, trim: true },
    salaryPeriod: {
      type: String,
      enum: ["hour", "month", "year"],
    },
    applicationDeadline: { type: Date },
    status: {
      type: String,
      enum: jobStatuses,
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ department: 1, status: 1 });
jobSchema.index({ featured: 1, status: 1 });

export type Job = InferSchemaType<typeof jobSchema>;

export const JobModel: Model<Job> =
  mongoose.models.Job ??
  mongoose.model<Job>("Job", jobSchema, mongoCollections.jobs);
