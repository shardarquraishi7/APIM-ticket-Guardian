import { tool } from 'ai';
import { z } from 'zod';
import { createLogger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

// Define types for the runbook data
interface TroubleshootingStep {
  step: number;
  description: string;
  action: string;
  visual_guidance: string;
}

interface RunbookEntry {
  source: string;
  runbook_title: string;
  problem_id: string;
  problem_category: string;
  problem_title: string;
  problem_description: string;
  troubleshooting_steps: TroubleshootingStep[];
  solution_summary: string;
  related_errors: string[];
  combined_text_for_embedding: string;
}

const logger = createLogger('get-information-tool');

// Load the runbook data from the JSON file
let RUNBOOK_DATA: RunbookEntry[] = [];
try {
  const runbookPath = path.join(process.cwd(), 'kb_source', 'improved_runbook_data.json');
  if (fs.existsSync(runbookPath)) {
    const runbookContent = fs.readFileSync(runbookPath, 'utf8');
    RUNBOOK_DATA = JSON.parse(runbookContent);
    logger.info(`Loaded ${RUNBOOK_DATA.length} runbook entries from ${runbookPath}`);
  } else {
    logger.warn(`Runbook file not found at ${runbookPath}`);
  }
} catch (error) {
  logger.error('Error loading runbook data:', error);
  RUNBOOK_DATA = [];
}

// Sample API Ticketing Support knowledge base content
const API_KNOWLEDGE = [
  `# API Ticketing Support Overview
  
  The API Ticketing Support system helps TELUS teams manage and resolve API-related issues efficiently. It provides a structured approach to documenting, tracking, and resolving API problems across different services and platforms.`,
  
  `# API Support Roles and Responsibilities
  
  - **API Product Owner**: Accountable for API functionality and performance within their domain
  - **Support Engineer**: Handles tier 1 and 2 support tickets for API issues
  - **Developer**: Implements fixes and enhancements based on ticket requirements
  - **QA Specialist**: Verifies API fixes and ensures they meet quality standards
  - **Technical Manager**: Provides oversight for critical API issues and escalations`,
  
  `# Common API Error Codes
  
  - **400 Bad Request**: The request could not be understood due to malformed syntax
  - **401 Unauthorized**: Authentication is required and has failed or not been provided
  - **403 Forbidden**: The server understood the request but refuses to authorize it
  - **404 Not Found**: The requested resource could not be found
  - **429 Too Many Requests**: The user has sent too many requests in a given amount of time
  - **500 Internal Server Error**: The server encountered an unexpected condition
  - **502 Bad Gateway**: The server received an invalid response from an upstream server
  - **503 Service Unavailable**: The server is currently unable to handle the request
  - **504 Gateway Timeout**: The server did not receive a timely response from an upstream server`,
  
  `# API Ticket Priority Levels
  
  - **P1 (Critical)**: Service outage affecting multiple customers or critical business functions
    - Response Time: 15 minutes
    - Resolution Target: 2 hours
  
  - **P2 (High)**: Significant impact to business operations, but with workaround available
    - Response Time: 30 minutes
    - Resolution Target: 4 hours
  
  - **P3 (Medium)**: Limited impact to business operations
    - Response Time: 2 hours
    - Resolution Target: 24 hours
  
  - **P4 (Low)**: Minimal impact, general questions or enhancement requests
    - Response Time: 8 hours
    - Resolution Target: 72 hours`,
  
  `# API Ticket Lifecycle
  
  1. **Creation**: Ticket is created with description, priority, and category
  2. **Triage**: Support team reviews and assigns the ticket
  3. **Investigation**: Technical analysis of the issue
  4. **Resolution**: Implementation of fix or workaround
  5. **Verification**: Testing to ensure the issue is resolved
  6. **Closure**: Ticket is closed with documentation of resolution
  
  For P1 and P2 tickets, status updates must be provided every hour until resolution.`,
  
  `# API Authentication Methods
  
  - **API Key**: Simple string token included in request header or query parameter
  - **OAuth 2.0**: Industry-standard protocol for authorization
  - **JWT (JSON Web Tokens)**: Compact, self-contained tokens for secure information transmission
  - **HMAC Authentication**: Uses a secret key and hash function to verify request integrity
  - **Certificate-based**: Uses X.509 certificates for authentication
  
  Each method has different security implications and appropriate use cases.`,
  
  `# API Rate Limiting
  
  Rate limiting controls how many API requests can be made within a specific time period:
  
  - **Standard Tier**: 100 requests per minute
  - **Premium Tier**: 500 requests per minute
  - **Enterprise Tier**: 2000 requests per minute
  
  When rate limits are exceeded, the API returns a 429 Too Many Requests status code.
  
  Implement exponential backoff in clients to handle rate limiting gracefully.`
];

// Convert runbook data to knowledge base format
const RUNBOOK_KNOWLEDGE = RUNBOOK_DATA.map((runbook: RunbookEntry) => {
  return `# ${runbook.problem_title}
  
  **Problem Category**: ${runbook.problem_category}
  **Problem Description**: ${runbook.problem_description}
  
  ## Troubleshooting Steps
  ${runbook.troubleshooting_steps.map((step: TroubleshootingStep) => 
    `${step.step}. ${step.description}: ${step.action}`
  ).join('\n  ')}
  
  ## Solution
  ${runbook.solution_summary}
  
  **Related Errors**: ${runbook.related_errors.join(', ')}`;
});

// Combine both knowledge sources
const COMBINED_KNOWLEDGE = [...API_KNOWLEDGE, ...RUNBOOK_KNOWLEDGE];

export const getInformation = () =>
  tool({
    description: 'Get information from the API Ticketing Support knowledge base to answer questions about API documentation, error codes, ticket management, and service level agreements.',
    parameters: z.object({
      question: z.string().describe('The user\'s question about API documentation, error troubleshooting, ticket management, or SLAs'),
    }),
    execute: async ({ question }) => {
      try {
        logger.info('Getting information from knowledge base', { question });
        
        // Simple keyword matching to find relevant information
        const keywords = question.toLowerCase().split(/\s+/);
        
        // First check runbook data for specific troubleshooting information
        let relevantRunbooks: RunbookEntry[] = [];
        if (RUNBOOK_DATA.length > 0) {
          relevantRunbooks = RUNBOOK_DATA.filter((runbook: RunbookEntry) => {
            // Check various fields for keyword matches
            const titleMatch = keywords.some(keyword => 
              keyword.length > 3 && runbook.problem_title.toLowerCase().includes(keyword)
            );
            
            const categoryMatch = keywords.some(keyword => 
              keyword.length > 3 && runbook.problem_category.toLowerCase().includes(keyword)
            );
            
            const descriptionMatch = keywords.some(keyword => 
              keyword.length > 3 && runbook.problem_description.toLowerCase().includes(keyword)
            );
            
            const errorMatch = runbook.related_errors.some((error: string) => 
              keywords.some(keyword => keyword.length > 3 && error.toLowerCase().includes(keyword))
            );
            
            const solutionMatch = keywords.some(keyword => 
              keyword.length > 3 && runbook.solution_summary.toLowerCase().includes(keyword)
            );
            
            return titleMatch || categoryMatch || descriptionMatch || errorMatch || solutionMatch;
          });
        }
        
        // Then check general API knowledge
        const relevantSources = COMBINED_KNOWLEDGE.filter(source => 
          keywords.some(keyword => 
            keyword.length > 3 && source.toLowerCase().includes(keyword)
          )
        );
        
        if (relevantSources.length === 0) {
          logger.info('No relevant information found in knowledge base');
          return 'No relevant information found in the knowledge base. Please use your general knowledge to immediately provide a complete answer to the user\'s question without any intermediate messages.';
        }
        
        logger.info('Found relevant information in knowledge base', { count: relevantSources.length });
        
        // Format the results for better readability
        const formattedResults = relevantSources.map((result, index) => {
          return `Source ${index + 1}:\n${result}\n`;
        }).join('\n');
        
        return `🔐 Knowledge Vault: Unlocked 🔐\n\n${formattedResults}\n\nUse this information to immediately provide a complete answer to the user's question without any intermediate messages.`;
      } catch (error) {
        logger.error('Error getting information from knowledge base', error);
        return 'An error occurred while retrieving information from the knowledge base. Please use your general knowledge to immediately provide a complete answer to the user\'s question without any intermediate messages.';
      }
    },
  });
