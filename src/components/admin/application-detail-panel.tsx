"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationDetails } from "@/components/admin/application-details";
import { AssessmentDetails } from "@/components/admin/assessment-details";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applicationStatuses } from "@/config/site";
import { formatLabel } from "@/lib/jobs/utils";
import type { ApplicationDocument, ApplicationStatus, AssessmentDocument } from "@/types";

export function ApplicationDetailPanel({
  application,
  assessment = null,
}: {
  application: ApplicationDocument;
  assessment?: AssessmentDocument | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [notes, setNotes] = useState(application.recruiterNotes || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/admin/applications/${application._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, recruiterNotes: notes }),
    });
    setLoading(false);
    if (response.ok) {
      setMessage("Application updated.");
      router.refresh();
    } else {
      setMessage("Unable to update application.");
    }
  }

  return (
    <div className="space-y-10">
      <ApplicationDetails application={application} />

      <section className="border-t border-slate-800 pt-8">
        <AssessmentDetails assessment={assessment} />
      </section>

      <section className="border-t border-slate-800 pt-8">
        <h2 className="text-lg font-semibold text-white">Recruiter actions</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Select
            label="Status"
            name="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ApplicationStatus)
            }
            options={applicationStatuses.map((value) => ({
              value,
              label: formatLabel(value),
            }))}
          />
        </div>

        <div className="mt-6">
          <Textarea
            label="Recruiter notes"
            name="recruiterNotes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        {message ? <p className="mt-4 text-sm text-brand-light">{message}</p> : null}

        <Button type="button" onClick={handleSave} disabled={loading} className="mt-6">
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </section>
    </div>
  );
}
