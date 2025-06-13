import { tool } from 'ai';
import { z } from 'zod';
import { createLogger } from '@/lib/logger';

const logger = createLogger('unable-to-answer-tool');

export const unableToAnswer = tool({
  description:
    "Use this tool when you cannot answer the user's question and need to forward it to the DEP Guardian team for assistance",
  parameters: z.object({
    question: z.string().describe('The question asked by the user'),
  }),
  execute: async ({ question }) => {
    // Log the question that couldn't be answered
    logger.info('Unable to answer question', { question });
    console.log('***Unable to answer question***:', question);
    
    return "I'm unable to answer this question. I've logged your question and it will be forwarded to the DEP Guardian team for assistance. They will get back to you as soon as possible.";
  },
});
