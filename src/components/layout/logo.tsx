import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  href?: string | null;
  priority?: boolean;
  layout?: "inline" | "stacked";
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  href = "/",
  priority = false,
  layout = "stacked",
}: LogoProps) {
  const content = (
    <div
      className={cn(
        "inline-flex items-center",
        layout === "stacked" ? "flex-col gap-2.5" : "flex-row gap-3",
        className,
      )}
    >
      <Image
        src="/images/nodemeta-logo.png"
        alt=""
        width={64}
        height={64}
        priority={priority}
        aria-hidden
        className={cn(
          "shrink-0 object-contain",
          layout === "stacked" ? "h-14 w-14 sm:h-16 sm:w-16" : "h-10 w-10 sm:h-11 sm:w-11",
          iconClassName,
        )}
      />
      <span className={cn("brand-logo-text select-none whitespace-nowrap", textClassName)} aria-label="NODEMETA">
        NODE<span className="brand-meta-text">META</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {content}
      </Link>
    );
  }

  return content;
}
