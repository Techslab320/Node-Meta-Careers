import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { mongoCollections } from "@/config/database";

const resumeFileSchema = new Schema(
  {
    filename: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, trim: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
);

export type ResumeFile = InferSchemaType<typeof resumeFileSchema>;

export const ResumeFileModel: Model<ResumeFile> =
  mongoose.models.ResumeFile ??
  mongoose.model<ResumeFile>(
    "ResumeFile",
    resumeFileSchema,
    mongoCollections.resumeFiles,
  );
