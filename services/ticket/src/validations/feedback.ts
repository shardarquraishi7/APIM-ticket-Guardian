import { z } from 'zod';

export const feedbackSchema = z.object({
  messageId: z.string().nonempty(),
  isPositive: z.boolean(),
  comments: z.string().nullable(),
});

export type FeedbackSchema = z.infer<typeof feedbackSchema>;
