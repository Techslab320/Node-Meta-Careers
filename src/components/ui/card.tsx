import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-lg shadow-cyan-500/5 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-200",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Alert({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "info" &&
          "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
        variant === "warning" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-100",
        variant === "success" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
      )}
      role="status"
    >
      {children}
    </div>
  );
}
