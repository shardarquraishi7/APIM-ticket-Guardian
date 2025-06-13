import { createOpenAI } from '@ai-sdk/openai';
import { OpenAI } from 'openai';

// Create OpenAI client using Fuelix proxy
// This is a company wrapper for OpenAI
export const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Fuelix handles auth differently
  dangerouslyAllowBrowser: true // Allow browser usage for development
});

// Create Vercel AI SDK OpenAI client
export const vercelOpenai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Fuelix handles auth differently
});
