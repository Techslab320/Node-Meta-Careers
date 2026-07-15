import { Download, ExternalLink } from "lucide-react";
import { JobDescriptionPdfViewer } from "./job-description-pdf-viewer";

interface JobDescriptionPdfProps {
  title: string;
  pdfUrl: string;
}

export function JobDescriptionPdf({ title, pdfUrl }: JobDescriptionPdfProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Job description</h2>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={pdfUrl}
            download
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-light hover:text-brand-light"
          >
            Download PDF
            <Download className="h-4 w-4" aria-hidden />
          </a>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-light hover:text-brand-light"
          >
            Open in new tab
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
      <JobDescriptionPdfViewer pdfUrl={pdfUrl} title={title} />
    </section>
  );
}
