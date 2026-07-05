import type { HydratedDocument } from "mongoose";
import { connectDB } from "@/lib/database/mongodb";
import { JobModel } from "@/models/Job";
import { nodeMetaPositions, positionToJobDocument } from "@/data/positions";
import type { Job } from "@/models/Job";

export async function resolvePublishedJobBySlug(
  jobSlug: string,
): Promise<HydratedDocument<Job> | null> {
  await connectDB();

  const existing = await JobModel.findOne({ slug: jobSlug, status: "published" });
  if (existing) {
    return existing;
  }

  const position = nodeMetaPositions.find((item) => item.slug === jobSlug);
  if (!position) {
    return null;
  }

  const document = positionToJobDocument(position, "seed");
  const {
    _id: _ignoredId,
    createdAt: _ignoredCreatedAt,
    updatedAt: _ignoredUpdatedAt,
    ...payload
  } = document;

  return JobModel.findOneAndUpdate(
    { slug: jobSlug },
    {
      ...payload,
      publishedAt: document.publishedAt ? new Date(document.publishedAt) : new Date(),
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
}
