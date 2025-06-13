import { generateObject, tool } from 'ai';
import { z } from 'zod';
import { vercelOpenai } from '@/lib/openai';
import { userService } from '@/services/user';
import { workforceFormSchema } from './schemas/workforce.schema';

export const createWorkforceJiraTicket = () =>
  tool({
    description: `Create a Jira ticket for the workforce team. ONLY use this tool when:
1. The user has provided a clear issue description AND
2. The request falls under one of these categories:
   - SSO onboarding with SAML
   - LDAP onboarding
   - Access Now onboarding
   - Identity security enhancements
   - Identity-specific feature requests
For all other requests (general questions, login issues, security key problems, application support, certificate issues, downtime/incidents), do NOT use this tool - instead use the getInformation tool to check the knowledge base for answers or direct users to SPOC/SRE support.`,
    parameters: z.object({
      issue: z.string().describe('The issue the user is having'),
    }),
    execute: async function ({ issue }, { messages }) {
      const key = 'WIR';
      const schema = workforceFormSchema;

      try {
        const filteredMessages = messages
          .filter((m) => m.role === 'user')
          .filter((m) => typeof m.content === 'string') as any[];

        const { email } = await userService.getUser();

        const { object: formData } = await generateObject({
          model: vercelOpenai('gpt-4o-mini-2024-07-18'),
          schema,
          prompt: `You are an expert at structured data extraction. You will analyze a list of chat messages to extract relevant information. The description should include the user's issue: ${issue} and the user's email: ${email}. Look through all messages to find any dates mentioned - if found, include them in the appropriate fields, otherwise use empty strings. Similarly, extract any DEP or WBScode if present, otherwise use empty strings. Structure all extracted information according to the provided schema. ${JSON.stringify(
            filteredMessages.join('\n'),
          )}`,
        });

        return { projectKey: key, initialData: formData };
      } catch (error) {
        console.error('error', error);
        return {
          projectKey: key,
          initialData: {},
          error: 'An error occurred while creating the Jira ticket',
        };
      }
    },
  });
