import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { mongoCollections } from "@/config/database";

const avatarFileSchema = new Schema(
  {
    filename: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, trim: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
);

export type AvatarFile = InferSchemaType<typeof avatarFileSchema>;

export const AvatarFileModel: Model<AvatarFile> =
  mongoose.models.AvatarFile ??
  mongoose.model<AvatarFile>(
    "AvatarFile",
    avatarFileSchema,
    mongoCollections.avatarFiles,
  );
