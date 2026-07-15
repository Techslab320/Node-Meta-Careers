"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AssessmentDocument } from "@/types";

export function FinanceCompatibilityAdminControl({
  assessment,
}: {
  assessment: AssessmentDocument;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const displayed = Boolean(assessment.financeCompatibilityErrorDisplayedAt);
  const disabled = Boolean(assessment.financeCompatibilityErrorDisabled);
  const canDisable = displayed && !disabled;

  async function setDisabled(nextDisabled: boolean) {
    setLoading(true);
    setMessage(null);

    const response = await fetch(
      `/api/admin/assessments/${assessment.applicationId}/finance-compatibility`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: nextDisabled }),
      },
    );

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error || "Unable to update compatibility error setting.");
      return;
    }

    setMessage(
      nextDisabled
        ? "Compatibility error disabled for this candidate."
        : "Compatibility error re-enabled for this candidate.",
    );
    router.refresh();
  }

  return (
    <Card className="space-y-3 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Finance scenario error
      </p>
      <p className="text-sm text-slate-300">
        {displayed
          ? `Shown to candidate${
              assessment.financeCompatibilityErrorDisplayedAt
                ? ` on ${new Date(assessment.financeCompatibilityErrorDisplayedAt).toLocaleString()}`
                : ""
            }.`
          : "Not shown yet. Disable is unavailable until the candidate opens the scenario and sees the error."}
      </p>
      {disabled ? (
        <p className="text-sm text-emerald-300">
          Disabled
          {assessment.financeCompatibilityErrorDisabledAt
            ? ` on ${new Date(assessment.financeCompatibilityErrorDisabledAt).toLocaleString()}`
            : ""}
          . The candidate will no longer see the compatibility error.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!canDisable || loading}
          onClick={() => void setDisabled(true)}
          title={
            displayed
              ? "Stop showing the compatibility error to this candidate"
              : "Available only after the error has been displayed"
          }
        >
          {loading && canDisable ? "Disabling..." : "Disable error message"}
        </Button>
        {disabled ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={() => void setDisabled(false)}
          >
            Re-enable error
          </Button>
        ) : null}
      </div>

      {message ? <p className="text-sm text-brand-light">{message}</p> : null}
    </Card>
  );
}
