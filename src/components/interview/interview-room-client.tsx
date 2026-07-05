"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Logo } from "@/components/layout/logo";
import { JoinedInterviewRoom } from "@/components/interview/joined-interview-room";
import {
  generateVerificationCode,
  getVerificationToastDelayMs,
  VerificationCodeModal,
} from "@/components/interview/verification-code-modal";
import type { ChatRoomSettingsInput } from "@/config/chat-room";
import {
  clearInterviewSession,
  candidateSessionRequestInit,
  loadInterviewSession,
  saveInterviewSession,
} from "@/lib/chat-room/candidate-session-storage";

interface JoinFormState {
  fullName: string;
  gmail: string;
  password: string;
  confirmPassword: string;
}

interface InterviewRoomClientProps {
  settings: ChatRoomSettingsInput;
}

function validateJoinForm(
  form: JoinFormState,
  settings: ChatRoomSettingsInput,
): string | null {
  if (!form.fullName.trim()) return "Full name is required.";
  if (!form.gmail.trim()) return "Gmail is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.gmail.trim())) {
    return "Please enter a valid Gmail address.";
  }
  if (settings.requireGmail && !form.gmail.trim().toLowerCase().endsWith("@gmail.com")) {
    return "Please use a Gmail address to join.";
  }
  if (!form.password) return "Password is required.";
  if (form.password.length < settings.minPasswordLength) {
    return `Password must be at least ${settings.minPasswordLength} characters.`;
  }
  if (form.password !== form.confirmPassword) return "Passwords do not match.";
  return null;
}

export function InterviewRoomClient({ settings }: InterviewRoomClientProps) {
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get("job") || "your application";
  const applicationId = searchParams.get("applicationId") || undefined;
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [activeJobTitle, setActiveJobTitle] = useState(jobTitle);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [candidateSessionToken, setCandidateSessionToken] = useState<string | null>(null);
  const [recruiterJoined, setRecruiterJoined] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [form, setForm] = useState<JoinFormState>({
    fullName: "",
    gmail: "",
    password: "",
    confirmPassword: "",
  });
  const [restoringSession, setRestoringSession] = useState(true);

  useEffect(() => {
    const storedSession = loadInterviewSession();
    if (!storedSession) {
      setRestoringSession(false);
      return;
    }

    let cancelled = false;

    const {
      sessionId: storedSessionId,
      candidateSessionToken: storedToken,
      participantName: storedParticipantName,
      jobTitle: storedJobTitle,
      applicationId: storedApplicationId,
    } = storedSession;

    async function restoreSession() {
      try {
        const requestInit = storedToken
          ? candidateSessionRequestInit(storedToken, { cache: "no-store" })
          : { cache: "no-store" as RequestCache };

        const response = await fetch(
          `/api/chat-room/session/${storedSessionId}/status`,
          requestInit,
        );
        if (!response.ok) {
          clearInterviewSession();
          return;
        }

        const data = (await response.json()) as {
          status?: string;
          recruiterJoined?: boolean;
        };

        if (cancelled || data.status === "left") {
          clearInterviewSession();
          return;
        }

        if (
          applicationId &&
          storedApplicationId &&
          storedApplicationId !== applicationId
        ) {
          clearInterviewSession();
          return;
        }

        setSessionId(storedSessionId);
        setCandidateSessionToken(storedToken ?? null);
        setParticipantName(storedParticipantName);
        setActiveJobTitle(storedJobTitle || jobTitle);
        setRecruiterJoined(Boolean(data.recruiterJoined));
        setJoined(true);
      } catch {
        clearInterviewSession();
      } finally {
        if (!cancelled) {
          setRestoringSession(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [applicationId, jobTitle]);

  function updateField<K extends keyof JoinFormState>(key: K, value: JoinFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const closeVerificationModal = useCallback(() => {
    setShowVerificationModal(false);
    setVerificationCode("");
    setVerificationError(null);
    setToastVisible(false);
    setToastMessage("");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!showVerificationModal || !verificationCode) return;

    const delayMs = getVerificationToastDelayMs();
    const timeoutId = window.setTimeout(() => {
      setToastMessage(`Your verification code: ${verificationCode}`);
      setToastVisible(true);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [showVerificationModal, verificationCode]);

  async function completeJoin() {
    setLoading(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/chat-room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.gmail.trim(),
          jobTitle,
          applicationId,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setVerificationError(payload.error || "Unable to join the interview room.");
        setLoading(false);
        return;
      }

      const data = (await response.json()) as {
        session: {
          _id: string;
          joinedHrInterviewerIndexes?: number[];
          status: string;
          candidateSessionToken?: string;
        };
      };
      const token = data.session.candidateSessionToken ?? "";
      setSessionId(data.session._id);
      setCandidateSessionToken(token);
      setRecruiterJoined((data.session.joinedHrInterviewerIndexes ?? []).includes(0));
      saveInterviewSession({
        sessionId: data.session._id,
        participantName: form.fullName.trim(),
        candidateEmail: form.gmail.trim().toLowerCase(),
        candidateSessionToken: token,
        jobTitle,
        applicationId,
      });
    } catch {
      setVerificationError("Unable to join the interview room.");
      setLoading(false);
      return;
    }

    setParticipantName(form.fullName.trim());
    setActiveJobTitle(jobTitle);
    setShowVerificationModal(false);
    setToastVisible(false);
    setJoined(true);
    setLoading(false);
  }

  function handleJoin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const validationError = validateJoinForm(form, settings);
    if (validationError) {
      setError(validationError);
      return;
    }

    setVerificationCode(generateVerificationCode());
    setVerificationError(null);
    setToastVisible(false);
    setToastMessage("");
    setShowVerificationModal(true);
  }

  function handleVerifyCode(enteredCode: string) {
    if (enteredCode !== verificationCode) {
      setVerificationError("Incorrect verification code. Please try again.");
      return;
    }

    void completeJoin();
  }

  if (!settings.isOpen) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg">
          <Logo href={null} className="justify-center" iconClassName="h-11 w-11" textClassName="text-2xl" />
          <h1 className="mt-6 text-center text-2xl font-bold text-white">{settings.roomName}</h1>
          <Alert variant="warning">
            The interview chat room is currently closed. Please check back shortly or contact recruiting.
          </Alert>
        </Card>
      </div>
    );
  }

  function handleLeaveRoom() {
    clearInterviewSession();
    setJoined(false);
    setSessionId(null);
    setCandidateSessionToken(null);
    setRecruiterJoined(false);
    setParticipantName("");
  }

  if (restoringSession) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-slate-400">
        Restoring interview room...
      </div>
    );
  }

  if (joined && sessionId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <JoinedInterviewRoom
          settings={settings}
          jobTitle={activeJobTitle}
          participantName={participantName}
          sessionId={sessionId}
          candidateSessionToken={candidateSessionToken ?? ""}
          initialRecruiterJoined={recruiterJoined}
          onLeave={handleLeaveRoom}
        />
      </div>
    );
  }

  if (joined) {
    return null;
  }

  return (
    <>
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      <VerificationCodeModal
        open={showVerificationModal}
        onClose={closeVerificationModal}
        onVerify={handleVerifyCode}
        loading={loading}
        error={verificationError}
      />

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg">
          <Logo href={null} className="justify-center" iconClassName="h-11 w-11" textClassName="text-2xl" />
          <h1 className="mt-6 text-center text-2xl font-bold text-white">{settings.roomName}</h1>
          <p className="mt-2 text-center text-sm text-slate-400">
            {settings.welcomeMessage}{" "}
            <strong className="text-slate-300">{jobTitle}</strong>
          </p>

          <form onSubmit={handleJoin} className="mt-8 space-y-4" noValidate>
            {error ? <Alert variant="warning">{error}</Alert> : null}

            <Input
              label="Full name"
              name="fullName"
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              required
            />
            <Input
              label="Gmail"
              name="gmail"
              type="email"
              autoComplete="email"
              placeholder="you@gmail.com"
              value={form.gmail}
              onChange={(event) => updateField("gmail", event.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required
            />
            <PasswordInput
              label="Confirm password"
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              required
            />

            <Button type="submit" disabled={loading || showVerificationModal} className="w-full">
              Join
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
