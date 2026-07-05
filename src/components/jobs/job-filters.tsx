"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatLabel } from "@/lib/jobs/utils";

interface JobFiltersProps {
  options: {
    departments: string[];
    locations: string[];
    remoteTypes: string[];
    employmentTypes: string[];
    experienceLevels: string[];
  };
}

export function JobFilters({ options }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 md:grid-cols-2 xl:grid-cols-3">
      <Input
        label="Keyword search"
        name="search"
        defaultValue={searchParams.get("search") || ""}
        placeholder="Search roles, skills, departments..."
        onChange={(event) => updateParam("search", event.target.value)}
      />
      <Select
        label="Department"
        name="department"
        value={searchParams.get("department") || ""}
        onChange={(event) => updateParam("department", event.target.value)}
        options={[
          { value: "", label: "All departments" },
          ...options.departments.map((value) => ({
            value,
            label: value,
          })),
        ]}
      />
      <Select
        label="Employment type"
        name="employmentType"
        value={searchParams.get("employmentType") || ""}
        onChange={(event) => updateParam("employmentType", event.target.value)}
        options={[
          { value: "", label: "All types" },
          ...options.employmentTypes.map((value) => ({
            value,
            label: formatLabel(value),
          })),
        ]}
      />
      <Select
        label="Experience level"
        name="experienceLevel"
        value={searchParams.get("experienceLevel") || ""}
        onChange={(event) => updateParam("experienceLevel", event.target.value)}
        options={[
          { value: "", label: "All levels" },
          ...options.experienceLevels.map((value) => ({
            value,
            label: formatLabel(value),
          })),
        ]}
      />
      <Select
        label="Location"
        name="location"
        value={searchParams.get("location") || ""}
        onChange={(event) => updateParam("location", event.target.value)}
        options={[
          { value: "", label: "All locations" },
          ...options.locations.map((value) => ({
            value,
            label: value,
          })),
        ]}
      />
      <Select
        label="Remote status"
        name="remoteType"
        value={searchParams.get("remoteType") || ""}
        onChange={(event) => updateParam("remoteType", event.target.value)}
        options={[
          { value: "", label: "All arrangements" },
          ...options.remoteTypes.map((value) => ({
            value,
            label: formatLabel(value),
          })),
        ]}
      />
    </div>
  );
}
