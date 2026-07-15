"use client";

import { useEffect, useState } from "react";

interface JobDescriptionPdfViewerProps {
  pdfUrl: string;
  title: string;
}

export function JobDescriptionPdfViewer({ pdfUrl, title }: JobDescriptionPdfViewerProps) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadPdf() {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error("Failed to load PDF");
        }

        const blob = await response.blob();
        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setViewerUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pdfUrl]);

  if (error) {
    return (
      <div className="flex min-h-[720px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-100 px-6 text-center text-sm text-slate-600">
        <p>Unable to display this PDF inline.</p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-dark hover:underline"
        >
          Open the PDF in a new tab
        </a>
      </div>
    );
  }

  if (!viewerUrl) {
    return (
      <div className="flex min-h-[720px] items-center justify-center rounded-xl border border-slate-800 bg-slate-100 text-sm text-slate-500">
        Loading job description PDF...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-white">
      <iframe
        src={`${viewerUrl}#view=FitH&toolbar=1&navpanes=0`}
        title={`${title} job description`}
        className="block h-[min(85vh,960px)] w-full min-h-[720px] bg-white"
      />
    </div>
  );
}
