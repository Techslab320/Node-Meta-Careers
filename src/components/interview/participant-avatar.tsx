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
    variant === "candidate" ? "border-brand-light/40" : "border-slate-700";

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
          variant === "candidate" && "bg-brand-light/15 text-brand-light",
          variant === "hr" && "bg-slate-800 text-slate-300",
          variant === "bot" && "border-brand-dark/30 bg-brand-dark/10 text-brand-light",
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
          variant === "candidate" ? "border-brand-light/40" : "border-slate-700",
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
          "border-brand-light/40 bg-brand-light/15 text-brand-light",
        variant === "hr" && "border-slate-700 bg-slate-800 text-slate-300",
        variant === "bot" && "border-brand-dark/30 bg-brand-dark/10 text-brand-light",
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
  showCaption?: boolean;
  onClick?: () => void;
}

export function ParticipantCard({
  name,
  role,
  avatarUrl,
  variant = "hr",
  avatarSize = "md",
  layout = "horizontal",
  fillAvatar = false,
  showCaption = true,
  onClick,
}: ParticipantCardProps) {
  const avatarSizeForLayout = fillAvatar ? "hero" : avatarSize;

  if (layout === "vertical") {
    const content = (
      <>
        <ParticipantAvatar
          name={name}
          avatarUrl={avatarUrl}
          variant={variant}
          size={avatarSizeForLayout}
          fill={fillAvatar}
        />
        {showCaption ? (
          <>
            <p className="mt-3 w-full truncate text-sm font-medium text-white">{name}</p>
            <p className="mt-0.5 w-full truncate text-xs text-slate-400">{role}</p>
          </>
        ) : null}
      </>
    );

    const className =
      "flex w-full flex-col items-center rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-center";

    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={cn(className, "cursor-pointer")}>
          {content}
        </button>
      );
    }

    return <div className={className}>{content}</div>;
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
