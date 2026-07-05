"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { candidateSessionRequestInit } from "@/lib/chat-room/candidate-session-storage";

interface CandidateAvatarUploadProps {
  sessionId: string;
  candidateSessionToken: string;
  onUploaded: (avatarUrl: string) => void;
}

export function CandidateAvatarUpload({
  sessionId,
  candidateSessionToken,
  onUploaded,
}: CandidateAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/chat-room/session/${sessionId}/avatar`,
        candidateSessionRequestInit(candidateSessionToken, {
          method: "POST",
          body: formData,
        }),
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to upload avatar.");
      }

      const data = (await response.json()) as { candidateAvatarUrl?: string; url?: string };
      const avatarUrl = data.candidateAvatarUrl || data.url;
      if (avatarUrl) onUploaded(avatarUrl);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Unable to upload avatar.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-3 w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" aria-hidden />
        {uploading ? "Uploading..." : "Upload photo"}
      </Button>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
