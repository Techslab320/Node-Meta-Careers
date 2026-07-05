import { employmentTypes, experienceLevels } from "@/config/site";
import { connectDB } from "@/lib/database/mongodb";
import { jobMatchesCompensationFilter } from "@/lib/jobs/compensation";
import { enrichJobDocument, serializeJob } from "@/lib/jobs/utils";
import {
  nodeMetaPositions,
  positionToJobDocument,
} from "@/data/positions";
import { JobModel } from "@/models/Job";
import type { JobDocument, JobFilters } from "@/types";

function filterJobs(jobs: JobDocument[], filters: JobFilters): JobDocument[] {
  return jobs
    .map(enrichJobDocument)
    .filter((job) => {
    if (filters.department && job.department !== filters.department) return false;
    if (
      !jobMatchesCompensationFilter(
        job.compensationBands,
        filters.employmentType,
        filters.experienceLevel,
      )
    ) {
      return false;
    }
    if (
      filters.location &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }
    if (filters.remoteType && job.remoteType !== filters.remoteType) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const haystack = [
        job.title,
        job.summary,
        job.department,
        ...job.technologies,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function getStaticPublishedJobs(): JobDocument[] {
  return nodeMetaPositions.map((position) =>
    positionToJobDocument(position, `static-${position.slug}`),
  );
}

function mergePublishedJobs(
  dbJobs: JobDocument[],
  staticJobs: JobDocument[],
): JobDocument[] {
  const bySlug = new Map<string, JobDocument>();

  for (const job of staticJobs) {
    bySlug.set(job.slug, job);
  }

  for (const job of dbJobs) {
    bySlug.set(job.slug, job);
  }

  return [...bySlug.values()].sort((left, right) => {
    const leftDate = left.publishedAt || left.createdAt;
    const rightDate = right.publishedAt || right.createdAt;
    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  });
}

function getStaticFilterOptions() {
  const jobs = getStaticPublishedJobs();
  return {
    departments: [...new Set(jobs.map((job) => job.department))].sort(),
    locations: [...new Set(jobs.map((job) => job.location))].sort(),
    remoteTypes: [...new Set(jobs.map((job) => job.remoteType))].sort(),
    employmentTypes: [...employmentTypes],
    experienceLevels: [...experienceLevels],
  };
}

export async function getPublishedJobs(
  filters: JobFilters = {},
): Promise<JobDocument[]> {
  const staticJobs = getStaticPublishedJobs();

  try {
    await connectDB();

    const query: Record<string, unknown> = { status: "published" };

    if (filters.department) query.department = filters.department;
    if (filters.location) query.location = new RegExp(filters.location, "i");
    if (filters.remoteType) query.remoteType = filters.remoteType;

    if (filters.search) {
      query.$or = [
        { title: new RegExp(filters.search, "i") },
        { summary: new RegExp(filters.search, "i") },
        { department: new RegExp(filters.search, "i") },
        { technologies: new RegExp(filters.search, "i") },
      ];
    }

    const jobs = await JobModel.find(query).sort({
      publishedAt: -1,
      createdAt: -1,
    });

    return filterJobs(mergePublishedJobs(jobs.map(serializeJob), staticJobs), filters);
  } catch {
    // Fall back to bundled positions when the database is unavailable.
  }

  return filterJobs(staticJobs, filters);
}

export async function getPublishedJobBySlug(
  slug: string,
): Promise<JobDocument | null> {
  try {
    await connectDB();
    const job = await JobModel.findOne({ slug, status: "published" });
    if (job) return serializeJob(job);
  } catch {
    // Fall back to bundled positions when the database is unavailable.
  }

  const position = nodeMetaPositions.find((item) => item.slug === slug);
  return position
    ? enrichJobDocument(positionToJobDocument(position, `static-${position.slug}`))
    : null;
}

export async function getLatestPublishedJobs(limit = 3): Promise<JobDocument[]> {
  const jobs = await getPublishedJobs();
  return jobs.slice(0, limit);
}

export async function getJobFilterOptions() {
  const staticOptions = getStaticFilterOptions();

  try {
    await connectDB();
    const jobs = await JobModel.find({ status: "published" }).select(
      "department location remoteType",
    );

    if (jobs.length === 0) {
      return staticOptions;
    }

    return {
      departments: [
        ...new Set([
          ...staticOptions.departments,
          ...jobs.map((job) => job.department),
        ]),
      ].sort(),
      locations: [
        ...new Set([...staticOptions.locations, ...jobs.map((job) => job.location)]),
      ].sort(),
      remoteTypes: [
        ...new Set([
          ...staticOptions.remoteTypes,
          ...jobs.map((job) => job.remoteType),
        ]),
      ].sort(),
      employmentTypes: [...employmentTypes],
      experienceLevels: [...experienceLevels],
    };
  } catch {
    // Fall back to bundled positions when the database is unavailable.
  }

  return staticOptions;
}

export async function getAllJobSlugs(): Promise<string[]> {
  const staticSlugs = nodeMetaPositions.map((position) => position.slug);

  try {
    await connectDB();
    const jobs = await JobModel.find({ status: "published" }).select("slug");
    const mergedSlugs = new Set([
      ...staticSlugs,
      ...jobs.map((job) => job.slug),
    ]);
    return [...mergedSlugs];
  } catch {
    // Fall back to bundled positions when the database is unavailable.
  }

  return staticSlugs;
}
