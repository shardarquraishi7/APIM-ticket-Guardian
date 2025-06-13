# Enhancing the TELUS Chatbot

This guide explains how to make the chatbot more interactive and intelligent by integrating it with AI services and adding database persistence.

## Table of Contents

1. [Integrating with OpenAI](#integrating-with-openai)
2. [Adding Database Persistence](#adding-database-persistence)
3. [Knowledge Base Integration](#knowledge-base-integration)
4. [Advanced Features](#advanced-features)
5. [Deployment Considerations](#deployment-considerations)

## Integrating with OpenAI

The current chatbot uses a simple rule-based response system. To make it more interactive and intelligent, you can integrate it with OpenAI's GPT models.

### Step 1: Install the OpenAI SDK

```bash
npm install openai
```

### Step 2: Set up your OpenAI API Key

If you don't already have an OpenAI API key in your environment:

1. Add your OpenAI API key to the `.env` file:

```
OPENAI_API_KEY=your_api_key_here
```

2. If you're using a proxy or alternative OpenAI endpoint, you can also specify the base URL:

```
OPENAI_BASE_URL=https://your-proxy-url
```

3. If you're using `.env.local` for local development (which is not committed to version control), the setup script will detect and respect this file. It will not modify your `.env.local` file if it already exists.

4. Make sure to add these variables to your Cloudflare Workers environment variables when deploying.

### Step 3: Use the OpenAI Integration

We've provided an example OpenAI integration in `src/lib/chatbot/openai-integration.ts`. This file includes:

- A function to generate AI responses using OpenAI's API
- A function to analyze user messages for intent and entities
- TypeScript interfaces for chat messages

### Step 4: Update the API Route

Replace the current API route with the enhanced version:

1. Rename `src/app/api/chatbot/enhanced-route.ts` to `route.ts` (replacing the existing file)
2. This enhanced route includes:
   - OpenAI integration for generating responses
   - Message analysis for understanding user intent
   - Database integration for storing conversations

## Adding Database Persistence

The current implementation stores conversations in memory, which means they are lost when the server restarts. To make the chatbot more robust, you should store conversations in a database.

### Step 1: Update the Database Schema

Add the following tables to your `database/schema.sql` file:

```sql
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chatbot_conversations (id) ON DELETE CASCADE
);
```

### Step 2: Apply the Schema to Your D1 Database

If you're using Cloudflare D1, apply the schema:

```bash
npx wrangler d1 execute YOUR_DB_NAME --file=./database/schema.sql
```

### Step 3: Use the Database in the API Route

The enhanced API route already includes database integration. It will:

1. Create a new conversation if needed
2. Store user messages in the database
3. Store bot responses in the database
4. Retrieve conversation history from the database

## Knowledge Base Integration

The chatbot can be enhanced with a knowledge base to provide more accurate and specific answers to user questions. This is implemented using vector embeddings for semantic search.

### Step 1: Set Up the Knowledge Base

1. Prepare your knowledge base data in JSON format. The expected structure is:

```json
[
  {
    "id": "1",
    "title": "Article Title",
    "content": "Article content goes here...",
    "category": "Optional category",
    "tags": ["tag1", "tag2"]
  },
  // More entries...
]
```

2. Add the path to your knowledge base file in the `.env` or `.env.local` file:

```
KNOWLEDGE_BASE_PATH=C:/path/to/your/knowledge-base.json
```

### Step 2: Use the Knowledge Base Integration

We've provided a knowledge base integration in `src/lib/chatbot/knowledge-base.ts`. This file includes:

- Functions to load and process the knowledge base
- Vector embedding generation for semantic search
- Retrieval of relevant information based on user queries

The integration automatically:

1. Loads the knowledge base from the specified JSON file
2. Generates vector embeddings for each entry using OpenAI's embedding model
3. Retrieves relevant information when a user asks a question
4. Provides this information to the AI model to generate more accurate responses

### Step 3: Customize the Knowledge Base Integration

You can customize the knowledge base integration by:

1. Modifying the `KnowledgeBaseEntry` interface to match your data structure
2. Adjusting the number of results returned by changing the `topK` parameter
3. Changing the embedding model or parameters for different performance characteristics
4. Implementing caching for embeddings to reduce API calls

### Step 4: Testing the Knowledge Base

To test if the knowledge base is working correctly:

1. Ask a question related to information in your knowledge base
2. Check the server logs to see if relevant entries are being retrieved
3. Verify that the response incorporates information from the knowledge base

## Advanced Features

Once you have the basic AI integration and database persistence in place, you can add more advanced features:

### 1. Message Analysis and Routing

The `analyzeMessage` function in the OpenAI integration can extract:
- User intent (question, complaint, request)
- Topic (internet, mobile, TV, billing)
- Entities (specific products or services mentioned)

You can use this information to:
- Route complex queries to specific handlers
- Trigger different responses based on intent
- Collect analytics on common user questions

### 2. Rich Responses

Enhance the chatbot to support rich responses:

```typescript
interface RichResponse {
  text: string;
  links?: Array<{ text: string; url: string }>;
  buttons?: Array<{ text: string; action: string }>;
  image?: { url: string; alt: string };
}
```

Update the ChatMessage component to render these rich responses.

### 3. User Feedback

Add thumbs up/down buttons to messages to collect feedback:

```typescript
async function submitFeedback(messageId: string, isPositive: boolean) {
  await fetch('/api/chatbot/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId, isPositive })
  });
}
```

Use this feedback to improve the chatbot over time.

### 4. Typing Indicators

Add a typing indicator to show when the bot is generating a response:

```typescript
function TypingIndicator() {
  return (
    <div className="flex space-x-2 p-2">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}
```

## Deployment Considerations

When deploying the enhanced chatbot, consider:

### 1. API Key Security

Never expose your OpenAI API key in client-side code. Always keep it server-side.

### 2. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// Simple rate limiting middleware
function rateLimit(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 requests per minute
  
  // Implement rate limiting logic here
}
```

### 3. Cost Management

OpenAI API calls cost money. Implement strategies to manage costs:

- Use a cheaper model for initial responses (gpt-3.5-turbo instead of gpt-4)
- Limit the maximum tokens per response
- Cache common responses
- Implement usage quotas per user

### 4. Monitoring and Analytics

Add monitoring to track:

- Response times
- Error rates
- Common user queries
- User satisfaction (based on feedback)

This data will help you improve the chatbot over time.

## Conclusion

By following these steps, you can transform the simple rule-based chatbot into an intelligent, interactive assistant that provides valuable information to users. The combination of AI-powered responses and database persistence creates a robust solution that can be extended with additional features as needed.
