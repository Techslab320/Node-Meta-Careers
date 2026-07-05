const STORAGE_KEY = "nodemeta-interview-session";

export interface StoredInterviewSession {
  sessionId: string;
  participantName: string;
  candidateEmail: string;
  candidateSessionToken: string;
  jobTitle: string;
  applicationId?: string;
}

export function saveInterviewSession(session: StoredInterviewSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadInterviewSession(): StoredInterviewSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredInterviewSession;
    if (!parsed.sessionId || !parsed.participantName || !parsed.candidateEmail) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearInterviewSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function candidateSessionRequestInit(
  token: string,
  init: RequestInit = {},
): RequestInit {
  return {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      "x-candidate-session-token": token,
    },
  };
}
