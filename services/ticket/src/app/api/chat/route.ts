import { streamText } from 'ai';
import type { Message } from 'ai';
import { system } from '@/ai/prompts';
import { CHAT_MODEL } from '@/constants';
import { createLogger } from '@/lib/logger';
import { vercelOpenai } from '@/lib/openai';
import { userService } from '@/services/user';
import { generateId } from '@/utils/generate-id';
import { getInformation } from '@/ai/tools/get-information';
import { unableToAnswer } from '@/ai/tools/unable-to-answer';
import { handleAPIMessages } from './api-middleware';

const logger = createLogger('chat');

// Allow streaming responses up to 30 seconds
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, chatState }: { chatId: string; messages: Array<Message>; chatState: any } = await req.json();

    const user = await userService.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Check if this is an API ticketing related message
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.role === 'user') {
        try {
          const apiResult = await handleAPIMessages(lastMessage, chatState || {});
          
          if (apiResult) {
            // Log the API result for debugging
            logger.info('API middleware result processed');
            
            // This is an API ticketing message, return the result directly
            return new Response(
              JSON.stringify({
                message: apiResult.message,
                state: apiResult.state
              }),
              { 
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }
        } catch (error) {
          logger.error('Error in API middleware:', error);
          // Continue with normal processing if API middleware fails
        }
      }
    }

    // Ensure compatibility with both HTTP/1.1 and HTTP/2
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no', // Disable KONG buffering
    });

    // Check if the request is using HTTP/2
    const isHttp2 = req.headers.get('x-forwarded-proto') === 'https';

    if (!isHttp2) {
      // For HTTP/1.1 (local development)
      headers.set('Connection', 'keep-alive');
      headers.set('Transfer-Encoding', 'chunked');
    }
    const result = streamText({
      model: vercelOpenai(CHAT_MODEL),
      system,
      maxTokens: 2048,
      messages,
      tools: {
        getInformation: getInformation(),
        unableToAnswer: unableToAnswer
      },
    });
    return new Response(result.toDataStream(), { headers });
  } catch (error) {
    logger.error({ error }, 'An unexpected error occurred in chat request');
    return new Response('Internal Server Error', { status: 500 });
  }
}
