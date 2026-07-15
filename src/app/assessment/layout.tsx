import { Suspense } from "react";
import { AssessmentBackButton } from "@/components/assessment/assessment-back-button";

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="shrink-0 px-4 py-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <AssessmentBackButton />
        </Suspense>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
