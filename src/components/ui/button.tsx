import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:from-cyan-400 hover:to-emerald-400",
  secondary:
    "border border-cyan-500/30 bg-slate-900/60 text-cyan-100 hover:border-cyan-400/50 hover:bg-slate-900",
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
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60",
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
