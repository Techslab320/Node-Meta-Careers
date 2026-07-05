import { NextResponse } from "next/server";
import { generateHrBotIntroduction, generateHrBotReply } from "@/lib/ai/hr-bot";
import { getChatRoomSettings } from "@/lib/chat-room/settings";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";
import { chatRoomMessageSchema } from "@/lib/validation/chat-room-message";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(getClientKey(request, "chat-room-message"), 30, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many chat messages" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = chatRoomMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid chat message" },
        { status: 400 },
      );
    }

    const settings = await getChatRoomSettings();
    if (!settings.isOpen || !settings.hrBotEnabled) {
      return NextResponse.json(
        { error: "HR bot is not enabled for this interview room." },
        { status: 403 },
      );
    }

    const interviewerName =
      settings.hrInterviewers[0]?.fullName.trim() || "HR interviewer";

    const reply = parsed.data.introduction
      ? await generateHrBotIntroduction({
          provider: settings.hrBotProvider,
          model: settings.hrBotModel,
          candidateName: parsed.data.candidateName,
          jobTitle: parsed.data.jobTitle,
          interviewerName,
        })
      : await generateHrBotReply({
          provider: settings.hrBotProvider,
          model: settings.hrBotModel,
          candidateName: parsed.data.candidateName,
          jobTitle: parsed.data.jobTitle,
          interviewerName,
          messages: [
            ...parsed.data.history.map((entry) => ({
              role: entry.role,
              content: entry.content,
            })),
            { role: "user" as const, content: parsed.data.message!.trim() },
          ],
        });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("HR bot chat failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to generate HR bot response",
      },
      { status: 500 },
    );
  }
}
