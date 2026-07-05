import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function Alert({
  title,
  children,
  href,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100",
        className,
      )}
    >
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div>
          {title ? <p className="font-medium text-amber-50">{title}</p> : null}
          <div className="mt-1 text-sm leading-6 text-amber-100/90">{children}</div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
