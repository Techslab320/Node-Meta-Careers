import { Badge, Card } from "@/components/ui/card";
import { FinanceCompatibilityAdminControl } from "@/components/admin/finance-compatibility-admin-control";
import { formatLabel } from "@/lib/jobs/utils";
import type { AssessmentDocument } from "@/types";

export function AssessmentDetails({
  assessment,
}: {
  assessment: AssessmentDocument | null;
}) {
  if (!assessment) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-white">Role assessment</h2>
        <p className="mt-4 text-sm text-slate-400">No assessment attempt recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-white">Role assessment</h2>
        <Badge>{formatLabel(assessment.status)}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Started</p>
          <p className="mt-1 text-sm text-white">
            {assessment.startedAt
              ? new Date(assessment.startedAt).toLocaleString()
              : "Not started"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Submitted</p>
          <p className="mt-1 text-sm text-white">
            {assessment.submittedAt
              ? new Date(assessment.submittedAt).toLocaleString()
              : "Not submitted"}
          </p>
        </Card>
      </div>

      {assessment.jobSlug === "finance-manager" ? (
        <FinanceCompatibilityAdminControl assessment={assessment} />
      ) : null}

      <div className="space-y-4">
        {assessment.answers.map((answer) => (
          <Card key={answer.questionNumber} className="p-5">
            <p className="text-sm font-medium text-brand-light">
              Question {answer.questionNumber}
            </p>
            <p className="mt-2 font-medium text-white">{answer.questionText}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {answer.answerText.trim() || "No answer provided."}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
