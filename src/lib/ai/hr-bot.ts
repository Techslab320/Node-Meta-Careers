import { getEnv } from "@/config/env";
import {
  defaultHrBotModel,
  defaultHrBotProvider,
  type HrBotProvider,
  normalizeHrBotModel,
} from "@/config/hr-bot-models";
import { siteConfig } from "@/config/site";

export type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface GenerateHrBotReplyInput {
  provider: HrBotProvider;
  model: string;
  messages: ChatCompletionMessage[];
  candidateName?: string;
  jobTitle?: string;
  interviewerName?: string;
}

function buildSystemPrompt(input: {
  candidateName?: string;
  jobTitle?: string;
  interviewerName?: string;
}): string {
  const interviewer = input.interviewerName || "HR interviewer";
  const job = input.jobTitle || "the open role";
  const candidate = input.candidateName || "the candidate";

  return [
    `You are ${interviewer}, an HR interviewer at ${siteConfig.companyName}.`,
    `${siteConfig.companyDescription}`,
    `You are conducting a brief introductory interview chat with ${candidate} for ${job}.`,
    "Be professional, warm, and concise. Ask one question at a time.",
    "Focus on background, motivation, relevant experience, and availability.",
    "Never ask for passwords, seed phrases, private keys, or cryptocurrency payments.",
    "If the candidate asks unrelated questions, gently redirect to the interview.",
  ].join(" ");
}

async function callChatCompletions(
  provider: HrBotProvider,
  model: string,
  messages: ChatCompletionMessage[],
): Promise<string> {
  const env = getEnv();
  const apiKey = provider === "groq" ? env.GROQ_API_KEY : env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      provider === "groq"
        ? "Groq API key is not configured."
        : "OpenAI API key is not configured.",
    );
  }

  const url =
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: normalizeHrBotModel(provider, model),
      messages,
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    const providerMessage = errorBody?.error?.message?.trim();
    if (providerMessage === "Forbidden" || response.status === 403) {
      throw new Error(
        provider === "groq"
          ? "Groq API rejected the request. Check GROQ_API_KEY in your environment."
          : "OpenAI API rejected the request. Check OPENAI_API_KEY in your environment.",
      );
    }
    throw new Error(providerMessage || "AI provider request failed.");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("AI provider returned an empty response.");
  }

  return content;
}

export async function generateHrBotReply(
  input: GenerateHrBotReplyInput,
): Promise<string> {
  const systemPrompt = buildSystemPrompt({
    candidateName: input.candidateName,
    jobTitle: input.jobTitle,
    interviewerName: input.interviewerName,
  });

  const messages: ChatCompletionMessage[] = [
    { role: "system", content: systemPrompt },
    ...input.messages,
  ];

  return callChatCompletions(
    input.provider,
    normalizeHrBotModel(input.provider, input.model || defaultHrBotModel),
    messages,
  );
}

export async function generateHrBotIntroduction(
  input: Omit<GenerateHrBotReplyInput, "messages">,
): Promise<string> {
  return generateHrBotReply({
    ...input,
    provider: input.provider || defaultHrBotProvider,
    model: input.model || defaultHrBotModel,
    messages: [
      {
        role: "user",
        content:
          "The candidate has just joined the interview chat room. Greet them warmly and ask your first introductory interview question.",
      },
    ],
  });
}
