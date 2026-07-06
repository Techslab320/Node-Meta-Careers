"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert, Card } from "@/components/ui/card";
import { adminPath } from "@/config/admin";
import {
  hrInterviewerCountOptions,
  hrInterviewerRoles,
  maxHrInterviewerCount,
  normalizeHrInterviewers,
} from "@/config/chat-room";
import type { ChatRoomSettingsInput, HrInterviewer, HrInterviewerRole } from "@/config/chat-room";
import type { ChatRoomSessionDocument } from "@/config/chat-room-session";
import {
  getDefaultModelForProvider,
  hrBotModels,
  type HrBotProvider,
} from "@/config/hr-bot-models";
import { getAvatarDisplayUrl, getInitials } from "@/lib/uploads/avatar-display";

interface ChatRoomSettingsFormProps {
  initialSettings: ChatRoomSettingsInput;
  chatSession?: ChatRoomSessionDocument | null;
}

function InterviewerAvatarPreview({
  fullName,
  avatarUrl,
}: {
  fullName: string;
  avatarUrl: string;
}) {
  const displayUrl = getAvatarDisplayUrl(avatarUrl);

  if (displayUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={displayUrl}
        alt=""
        className="h-20 w-20 shrink-0 rounded-full border-2 border-slate-600 object-cover"
      />
    );
  }

  const initials = getInitials(fullName);

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800 text-lg font-semibold text-slate-300">
      {initials}
    </div>
  );
}

export function ChatRoomSettingsForm({
  initialSettings,
  chatSession = null,
}: ChatRoomSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(() => ({
    ...initialSettings,
    hrInterviewerCount: Math.min(
      maxHrInterviewerCount,
      Math.max(1, initialSettings.hrInterviewerCount),
    ),
    hrInterviewers: normalizeHrInterviewers(
      initialSettings.hrInterviewerCount,
      initialSettings.hrInterviewers,
    ),
  }));
  const [session, setSession] = useState(chatSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    setSettings({
      ...initialSettings,
      hrInterviewerCount: Math.min(
        maxHrInterviewerCount,
        Math.max(1, initialSettings.hrInterviewerCount),
      ),
      hrInterviewers: normalizeHrInterviewers(
        initialSettings.hrInterviewerCount,
        initialSettings.hrInterviewers,
      ),
    });
  }, [initialSettings]);

  useEffect(() => {
    setSession(chatSession);
  }, [chatSession]);

  function updateField<K extends keyof ChatRoomSettingsInput>(
    key: K,
    value: ChatRoomSettingsInput[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSuccess(null);
  }

  function updateInterviewerCount(count: number) {
    const hrInterviewerCount = Math.min(
      maxHrInterviewerCount,
      Math.max(1, count),
    );
    setSettings((current) => ({
      ...current,
      hrInterviewerCount,
      hrInterviewers: normalizeHrInterviewers(hrInterviewerCount, current.hrInterviewers),
    }));
    setSuccess(null);
  }

  function updateInterviewer(index: number, field: keyof HrInterviewer, value: string) {
    setSettings((current) => ({
      ...current,
      hrInterviewers: current.hrInterviewers.map((interviewer, interviewerIndex) =>
        interviewerIndex === index ? { ...interviewer, [field]: value } : interviewer,
      ),
    }));
    setSuccess(null);
  }

  function updateHrBotProvider(provider: HrBotProvider) {
    setSettings((current) => ({
      ...current,
      hrBotProvider: provider,
      hrBotModel: getDefaultModelForProvider(provider),
    }));
    setSuccess(null);
  }

  async function uploadInterviewerAvatar(index: number, file: File) {
    setUploadingIndex(index);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/uploads/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error || "Unable to upload avatar");
        return;
      }

      const result = (await response.json()) as { url: string };
      updateInterviewer(index, "avatarUrl", result.url);
    } catch {
      setError("Unable to upload avatar");
    } finally {
      setUploadingIndex(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...settings,
      hrInterviewers: normalizeHrInterviewers(
        settings.hrInterviewerCount,
        settings.hrInterviewers,
      ),
    };

    const response = await fetch("/api/admin/chat-room", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setLoading(false);
      const data = (await response.json()) as { error?: string };
      setError(data.error || "Unable to join chat room");
      return;
    }

    const data = (await response.json()) as { settings: ChatRoomSettingsInput };
    setSettings(data.settings);

    if (session?._id) {
      if (session.status !== "in_progress") {
        const joinResponse = await fetch(
          `/api/admin/chat-room/session/${session._id}/join`,
          { method: "PATCH" },
        );

        if (!joinResponse.ok) {
          setLoading(false);
          const joinPayload = (await joinResponse.json()) as { error?: string };
          setError(joinPayload.error || "Settings saved, but unable to join chat room.");
          return;
        }

        const joinData = (await joinResponse.json()) as { session: ChatRoomSessionDocument };
        setSession(joinData.session);
      }

      setLoading(false);
      router.push(adminPath(`chat-room/session/${session._id}/live`));
      return;
    }

    setLoading(false);
    setSuccess("Settings saved. Open a candidate chat room to join an interview.");
  }

  return (
    <div className="space-y-8">
      {error ? <Alert variant="warning">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">HR interviewers</h2>
            <p className="mt-1 text-sm text-slate-400">
              Set how many HR interviewers appear in the chat room and configure their profile.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-28">
              <Select
                label="Count"
                name="hrInterviewerCount"
                value={String(settings.hrInterviewerCount)}
                onChange={(event) =>
                  updateInterviewerCount(Number(event.target.value))
                }
                options={hrInterviewerCountOptions.map((value) => ({
                  value: String(value),
                  label: String(value),
                }))}
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-4">
            {settings.hrInterviewers.map((interviewer, index) => (
              <div
                key={index}
                className="flex w-[220px] shrink-0 flex-col space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <div className="space-y-3">
                  <span className="text-xs font-medium text-slate-500">#{index + 1}</span>
                  <div className="flex justify-center">
                    <InterviewerAvatarPreview
                      fullName={interviewer.fullName}
                      avatarUrl={interviewer.avatarUrl}
                    />
                  </div>
                </div>

                <Input
                  label="Full name"
                  name={`hrInterviewers.${index}.fullName`}
                  value={interviewer.fullName}
                  onChange={(event) =>
                    updateInterviewer(index, "fullName", event.target.value)
                  }
                  required
                />

                <Select
                  label="Role"
                  name={`hrInterviewers.${index}.role`}
                  value={interviewer.role}
                  onChange={(event) =>
                    updateInterviewer(index, "role", event.target.value as HrInterviewerRole)
                  }
                  options={hrInterviewerRoles.map((role) => ({
                    value: role,
                    label: role,
                  }))}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Avatar</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploadingIndex === index}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadInterviewerAvatar(index, file);
                      event.target.value = "";
                    }}
                    className="block w-full text-xs text-slate-400 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:text-slate-200 hover:file:bg-slate-700"
                  />
                  {uploadingIndex === index ? (
                    <p className="mt-1 text-xs text-slate-500">Uploading...</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">HR bot</h2>
            <p className="mt-1 text-sm text-slate-400">
              Enable an automated HR bot to assist candidates in the interview chat room.
            </p>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
            <span>HR bot</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.hrBotEnabled}
              onClick={() => updateField("hrBotEnabled", !settings.hrBotEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                settings.hrBotEnabled ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  settings.hrBotEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>
          <p className="text-xs text-slate-500">
            {settings.hrBotEnabled
              ? "HR bot is enabled for candidate interviews."
              : "HR bot is disabled. Only configured HR interviewers will appear."}
          </p>

          {settings.hrBotEnabled ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[160px]">
                <Select
                  label="AI provider"
                  name="hrBotProvider"
                  value={settings.hrBotProvider}
                  onChange={(event) =>
                    updateHrBotProvider(event.target.value as HrBotProvider)
                  }
                  options={[
                    { value: "groq", label: "Groq" },
                    { value: "openai", label: "OpenAI" },
                  ]}
                />
              </div>
              <div className="min-w-[220px] flex-1">
                <Select
                  label="AI model"
                  name="hrBotModel"
                  value={settings.hrBotModel}
                  onChange={(event) => updateField("hrBotModel", event.target.value)}
                  options={hrBotModels[settings.hrBotProvider].map((model) => ({
                    value: model.id,
                    label: model.label,
                  }))}
                />
              </div>
            </div>
          ) : null}
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !session?._id} className="min-w-28">
            {loading
              ? "Joining..."
              : session?.status === "in_progress"
                ? "Open chat room"
                : "Join"}
          </Button>
        </div>
      </form>
    </div>
  );
}
