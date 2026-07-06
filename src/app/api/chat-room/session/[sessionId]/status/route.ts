import { NextResponse } from "next/server";
import { getCandidateSessionTokenFromRequest } from "@/lib/chat-room/candidate-session-auth";
import { buildJoinedHrInterviewerViews } from "@/lib/chat-room/interviewer-presence";
import { markSessionLeft, touchSessionPresenceForCandidate } from "@/lib/chat-room/sessions";
import { getChatRoomSettings } from "@/lib/chat-room/settings";


export const runtime = "nodejs";
interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const token = getCandidateSessionTokenFromRequest(request);
    const session = await touchSessionPresenceForCandidate(sessionId, token);

    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 403 });
    }

    const settings = await getChatRoomSettings();
    const joinedHrInterviewers = buildJoinedHrInterviewerViews(
      session.joinedHrInterviewerIndexes,
      settings,
    );

    return NextResponse.json({
      sessionId: session._id,
      status: session.status,
      recruiterJoined: session.joinedHrInterviewerIndexes.includes(0),
      joinedHrInterviewerIndexes: session.joinedHrInterviewerIndexes,
      joinedHrInterviewers,
      hrBotEnabledIndexes: session.hrBotEnabledIndexes,
      candidateAvatarUrl: session.candidateAvatarUrl,
      hrBotFeatureEnabled: settings.hrBotEnabled,
    });
  } catch (error) {
    console.error("Failed to load session status", error);
    return NextResponse.json({ error: "Unable to load session status" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const token = getCandidateSessionTokenFromRequest(request);
    const session = await markSessionLeft(sessionId, token);
    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark session as left", error);
    return NextResponse.json({ error: "Unable to leave session" }, { status: 500 });
  }
}
