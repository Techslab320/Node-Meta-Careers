import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  href?: string | null;
  priority?: boolean;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  href = "/",
  priority = false,
}: LogoProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/images/nodemeta-logo.png"
        alt=""
        width={48}
        height={48}
        priority={priority}
        aria-hidden
        className={cn("h-10 w-10 shrink-0 sm:h-11 sm:w-11", iconClassName)}
      />
      <span
        className={cn(
          "select-none font-bold tracking-tight text-white",
          "text-[1.35rem] leading-none sm:text-[1.55rem]",
          textClassName,
        )}
        aria-label="NODEMETA"
      >
        <span className="text-white">NODE</span>
        <span className="text-[#2ec4b6]">META</span>
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
