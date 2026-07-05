import { z } from "zod";

export const chatRoomMessageSchema = z
  .object({
    message: z.string().max(2000).optional(),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(1).max(4000),
        }),
      )
      .max(30)
      .default([]),
    candidateName: z.string().min(1).max(120).optional(),
    jobTitle: z.string().min(1).max(200).optional(),
    introduction: z.boolean().optional(),
  })
  .superRefine((data, context) => {
    if (!data.introduction && !data.message?.trim()) {
      context.addIssue({
        code: "custom",
        message: "Message is required",
        path: ["message"],
      });
    }
  });

export type ChatRoomMessageInput = z.infer<typeof chatRoomMessageSchema>;
