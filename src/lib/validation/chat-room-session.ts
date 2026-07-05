import { z } from "zod";

export const joinChatRoomSessionSchema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email().max(200),
  jobTitle: z.string().min(1).max(200),
  applicationId: z.string().optional(),
});
