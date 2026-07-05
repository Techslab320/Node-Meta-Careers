import { connectDB } from "@/lib/database/mongodb";
import { mongoCollections, mongoDatabaseName } from "@/config/database";
import { JobModel } from "@/models/Job";
import { nodeMetaPositions, positionToJobDocument } from "@/data/positions";

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to seed the database");
  }

  await connectDB();
  console.log(`Using database: ${mongoDatabaseName}`);
  console.log(`Collections: ${mongoCollections.jobs}, ${mongoCollections.applications}`);

  await JobModel.deleteMany({ title: { $regex: "^\\[SAMPLE\\]" } });

  for (const position of nodeMetaPositions) {
    const document = positionToJobDocument(position, "seed");
    const {
      _id: _ignoredId,
      createdAt: _ignoredCreatedAt,
      updatedAt: _ignoredUpdatedAt,
      ...payload
    } = document;

    await JobModel.findOneAndUpdate(
      { slug: position.slug },
      payload,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log(
      `Seeded position: ${position.title} (${payload.compensationBands.length} compensation bands)`,
    );
  }

  console.log(`Seed completed. ${nodeMetaPositions.length} published positions are ready.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
