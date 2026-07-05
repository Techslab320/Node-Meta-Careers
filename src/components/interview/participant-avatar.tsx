import { Bot, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials, getPublicAvatarDisplayUrl } from "@/lib/uploads/avatar-display";

interface ParticipantAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: keyof typeof sizeClasses;
  variant?: "hr" | "candidate" | "bot";
  fill?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
  "2xl": "h-28 w-28 text-xl",
  hero: "h-40 w-40 text-2xl",
} as const;

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
  hero: "h-12 w-12",
} as const;

const largeAvatarBorder = (size: keyof typeof sizeClasses) =>
  size === "xl" || size === "2xl" || size === "hero" ? "border-2" : "border";

export function ParticipantAvatar({
  name,
  avatarUrl,
  size = "md",
  variant = "hr",
  fill = false,
  className,
}: ParticipantAvatarProps) {
  const displayUrl = avatarUrl ? getPublicAvatarDisplayUrl(avatarUrl) : null;
  const initials = getInitials(name || "?");
  const borderClass =
    variant === "candidate" ? "border-cyan-500/40" : "border-slate-700";

  if (fill) {
    if (displayUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt={name}
          className={cn(
            "aspect-square w-full rounded-full border-2 object-cover",
            borderClass,
            className,
          )}
        />
      );
    }

    return (
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-full border-2 text-3xl font-semibold",
          borderClass,
          variant === "candidate" && "bg-cyan-500/15 text-cyan-200",
          variant === "hr" && "bg-slate-800 text-slate-300",
          variant === "bot" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
          className,
        )}
      >
        {variant === "bot" ? (
          <Bot className="h-12 w-12" aria-hidden />
        ) : (
          initials || <UserRound className="h-12 w-12" aria-hidden />
        )}
      </div>
    );
  }

  if (displayUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displayUrl}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover",
          largeAvatarBorder(size),
          sizeClasses[size],
          variant === "candidate" ? "border-cyan-500/40" : "border-slate-700",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        largeAvatarBorder(size),
        sizeClasses[size],
        variant === "candidate" &&
          "border-cyan-500/40 bg-cyan-500/15 text-cyan-200",
        variant === "hr" && "border-slate-700 bg-slate-800 text-slate-300",
        variant === "bot" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
      )}
    >
      {variant === "bot" ? (
        <Bot className={iconSizeClasses[size]} aria-hidden />
      ) : variant === "candidate" ? (
        initials || <UserRound className={iconSizeClasses[size]} aria-hidden />
      ) : (
        initials || <UserRound className={iconSizeClasses[size]} aria-hidden />
      )}
    </div>
  );
}

interface ParticipantCardProps {
  name: string;
  role: string;
  avatarUrl?: string;
  variant?: "hr" | "candidate" | "bot";
  avatarSize?: keyof typeof sizeClasses;
  layout?: "horizontal" | "vertical";
  fillAvatar?: boolean;
}

export function ParticipantCard({
  name,
  role,
  avatarUrl,
  variant = "hr",
  avatarSize = "md",
  layout = "horizontal",
  fillAvatar = false,
}: ParticipantCardProps) {
  if (layout === "vertical") {
    return (
      <div className="flex w-full flex-col items-center rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-center">
        <ParticipantAvatar
          name={name}
          avatarUrl={avatarUrl}
          variant={variant}
          size={fillAvatar ? "hero" : avatarSize}
          fill={fillAvatar}
        />
        <p className="mt-4 w-full truncate text-base font-medium text-white">{name}</p>
        <p className="mt-1 w-full truncate text-sm text-slate-400">{role}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
      <ParticipantAvatar
        name={name}
        avatarUrl={avatarUrl}
        variant={variant}
        size={avatarSize}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{name}</p>
        <p className="truncate text-xs text-slate-400">{role}</p>
      </div>
    </div>
  );
}
