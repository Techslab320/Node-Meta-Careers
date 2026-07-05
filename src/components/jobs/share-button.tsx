"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareJobButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleShare}>
      <Share2 className="h-4 w-4" aria-hidden />
      {copied ? "Link copied" : "Share job"}
    </Button>
  );
}
