"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminPath } from "@/config/admin";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  departments,
  employmentTypes,
  experienceLevels,
  jobStatuses,
  remoteTypes,
} from "@/config/site";
import { generateSlug, formatLabel } from "@/lib/jobs/utils";
import type { JobDocument } from "@/types";

interface JobFormProps {
  initialData?: JobDocument;
}

function listToTextarea(items?: string[]) {
  return (items || []).join("\n");
}

export function JobForm({ initialData }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const body = {
      ...payload,
      featured: formData.get("featured") === "on",
      salaryMin: payload.salaryMin ? Number(payload.salaryMin) : undefined,
      salaryMax: payload.salaryMax ? Number(payload.salaryMax) : undefined,
    };

    const url = initialData
      ? `/api/admin/jobs/${initialData._id}`
      : "/api/admin/jobs";
    const method = initialData ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error || "Unable to save job");
      return;
    }

    router.push(adminPath("jobs"));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!initialData) setSlug(generateSlug(event.target.value));
          }}
          required
        />
        <Input
          label="Slug"
          name="slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
        <Select
          label="Department"
          name="department"
          defaultValue={initialData?.department || departments[0]}
          options={departments.map((value) => ({ value, label: value }))}
        />
        <Input
          label="Location"
          name="location"
          defaultValue={initialData?.location || ""}
          required
        />
        <Select
          label="Remote type"
          name="remoteType"
          defaultValue={initialData?.remoteType || "remote"}
          options={remoteTypes.map((value) => ({
            value,
            label: formatLabel(value),
          }))}
        />
        <Select
          label="Employment type"
          name="employmentType"
          defaultValue={initialData?.employmentType || "full-time"}
          options={employmentTypes.map((value) => ({
            value,
            label: formatLabel(value),
          }))}
        />
        <Select
          label="Experience level"
          name="experienceLevel"
          defaultValue={initialData?.experienceLevel || "mid-level"}
          options={experienceLevels.map((value) => ({
            value,
            label: formatLabel(value),
          }))}
        />
        <Select
          label="Status"
          name="status"
          defaultValue={initialData?.status || "draft"}
          options={jobStatuses.map((value) => ({
            value,
            label: formatLabel(value),
          }))}
        />
        <Input
          label="Salary min"
          name="salaryMin"
          type="number"
          defaultValue={initialData?.salaryMin ?? ""}
        />
        <Input
          label="Salary max"
          name="salaryMax"
          type="number"
          defaultValue={initialData?.salaryMax ?? ""}
        />
        <Input
          label="Salary currency"
          name="salaryCurrency"
          defaultValue={initialData?.salaryCurrency || "USD"}
        />
        <Select
          label="Salary period"
          name="salaryPeriod"
          defaultValue={initialData?.salaryPeriod || "year"}
          options={[
            { value: "hour", label: "Hour" },
            { value: "month", label: "Month" },
            { value: "year", label: "Year" },
          ]}
        />
      </div>

      <Textarea
        label="Summary"
        name="summary"
        defaultValue={initialData?.summary || ""}
        required
      />
      <Textarea
        label="Overview"
        name="overview"
        defaultValue={initialData?.overview || ""}
        required
      />
      <Textarea
        label="Responsibilities (one per line)"
        name="responsibilities"
        defaultValue={listToTextarea(initialData?.responsibilities)}
      />
      <Textarea
        label="Required qualifications (one per line)"
        name="requiredQualifications"
        defaultValue={listToTextarea(initialData?.requiredQualifications)}
      />
      <Textarea
        label="Preferred qualifications (one per line)"
        name="preferredQualifications"
        defaultValue={listToTextarea(initialData?.preferredQualifications)}
      />
      <Textarea
        label="Technologies (one per line)"
        name="technologies"
        defaultValue={listToTextarea(initialData?.technologies)}
      />
      <Textarea
        label="Benefits (one per line)"
        name="benefits"
        defaultValue={listToTextarea(initialData?.benefits)}
      />

      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={initialData?.featured}
          className="h-4 w-4 rounded border-slate-600 bg-slate-900"
        />
        Featured position
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : initialData ? "Update job" : "Create job"}
      </Button>
    </form>
  );
}
