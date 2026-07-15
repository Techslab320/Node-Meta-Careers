import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { assessmentStatuses } from "@/types";
import { mongoCollections } from "@/config/database";

const assessmentAnswerSchema = new Schema(
  {
    questionNumber: { type: Number, required: true, min: 1, max: 10 },
    questionText: { type: String, required: true, trim: true },
    answerText: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const assessmentSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
      index: true,
    },
    jobSlug: { type: String, required: true, trim: true, index: true },
    jobTitle: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: assessmentStatuses,
      default: "waiting",
      index: true,
    },
    startedAt: { type: Date },
    endsAt: { type: Date },
    submittedAt: { type: Date },
    answers: { type: [assessmentAnswerSchema], default: [] },
    financeCompatibilityErrorDisplayedAt: { type: Date },
    financeCompatibilityErrorDisabled: { type: Boolean, default: false },
    financeCompatibilityErrorDisabledAt: { type: Date },
  },
  { timestamps: true },
);

export type Assessment = InferSchemaType<typeof assessmentSchema>;

const assessmentModelName = "Assessment";

if (mongoose.models[assessmentModelName]) {
  delete mongoose.models[assessmentModelName];
}

export const AssessmentModel: Model<Assessment> = mongoose.model<Assessment>(
  assessmentModelName,
  assessmentSchema,
  mongoCollections.assessments,
);
