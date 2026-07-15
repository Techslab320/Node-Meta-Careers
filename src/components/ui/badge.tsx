import { cn } from "@/lib/utils";

const variants = {
  default: "bg-slate-800/80 text-slate-200",
  cyan: "bg-brand-light/10 text-brand-light border border-brand-light/20",
  green: "bg-brand-dark/10 text-brand-light border border-brand-dark/20",
  yellow: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  red: "bg-red-500/10 text-red-300 border border-red-500/20",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
