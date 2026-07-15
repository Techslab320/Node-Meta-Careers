import { cn } from "@/lib/utils";

const variants = {
  primary:
    "brand-gradient-bg text-white hover:opacity-95",
  secondary:
    "border border-brand-light/30 bg-brand-surface/60 text-brand-light hover:border-brand-light/50 hover:bg-brand-surface",
  ghost: "text-slate-300 hover:bg-slate-800/80 hover:text-white",
  danger:
    "border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-[#080612] disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
