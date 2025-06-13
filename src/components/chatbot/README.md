# TELUS Chatbot Component

This directory contains a set of React components for building a chatbot interface in the Next.js Cloudflare Workers Starter Kit.

## Components Overview

### 1. ChatContainer

The main container component that holds the chat interface, including messages and input.

**Features:**
- Displays chat messages
- Handles user input
- Shows loading state
- Auto-scrolls to the latest message
- Manages conversation state

**Usage:**
```tsx
import ChatContainer, { Message } from '@/components/chatbot/ChatContainer';

// Example initial messages
const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    type: 'bot',
    timestamp: new Date(),
  },
];

// Example usage
<ChatContainer
  initialMessages={initialMessages}
  onSendMessage={async (message) => {
    // Handle sending message to API
    const response = await sendMessageToAPI(message);
    return response;
  }}
  isLoading={false}
  className="h-[600px]"
/>
```

### 2. ChatMessage

A component to display individual chat messages with different styling for user and bot messages.

**Features:**
- Different styling for user and bot messages
- Displays message timestamp
- Responsive design

**Usage:**
```tsx
import ChatMessage from '@/components/chatbot/ChatMessage';

<ChatMessage
  content="Hello, how can I help you?"
  type="bot"
  timestamp={new Date()}
/>

<ChatMessage
  content="I have a question about my service."
  type="user"
  timestamp={new Date()}
/>
```

### 3. ChatInput

A component for user input with a send button.

**Features:**
- Text input field
- Send button
- Keyboard shortcut (Enter to send)
- Disabled state for when the chatbot is processing

**Usage:**
```tsx
import ChatInput from '@/components/chatbot/ChatInput';

<ChatInput
  onSendMessage={(message) => {
    console.log('Message sent:', message);
    // Handle sending message
  }}
  disabled={false}
  placeholder="Type your message..."
/>
```

## API Integration

The chatbot is designed to work with the API route at `/api/chatbot`. The current implementation uses a simple rule-based response system, but you can extend it to integrate with an AI service.

### Current API Implementation

The current API route (`/api/chatbot/route.ts`) includes:

- POST endpoint for sending messages
- GET endpoint for retrieving conversation history
- In-memory storage for conversations (for demonstration purposes)

### Extending with AI Integration

To integrate with an AI service like OpenAI or Azure OpenAI:

1. Update the `generateSimpleResponse` function in `/api/chatbot/route.ts` to call your AI service
2. Add appropriate authentication and API keys
3. Implement conversation history storage in a database

Example integration with OpenAI:

```typescript
// Example OpenAI integration (you'll need to install the OpenAI SDK)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAIResponse(message: string, conversationHistory: Array<{ role: string; content: string }>) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful TELUS assistant." },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return "I'm sorry, I encountered an error while processing your request.";
  }
}
```

## Styling

The components use Tailwind CSS for styling and are designed to match the TELUS design system. You can customize the appearance by modifying the CSS classes in each component.

Key styling elements:
- TELUS purple for user messages
- Light gray for bot messages
- Rounded corners with speech bubble appearance
- Responsive layout that works on mobile and desktop

## Database Integration

For a production chatbot, you'll want to store conversations in a database rather than in memory. The starter kit includes Cloudflare D1 integration that you can use for this purpose.

Example schema for storing conversations:

```sql
-- Add to database/schema.sql
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

## Future Enhancements

Some ideas for enhancing the chatbot:

1. **Rich Messages**: Add support for images, links, and formatted text
2. **User Feedback**: Add thumbs up/down buttons for message feedback
3. **Typing Indicator**: Show when the bot is "typing" a response
4. **Message Templates**: Create templates for common message types
5. **File Upload**: Allow users to upload files in the chat
6. **Voice Input**: Add speech-to-text for voice input
7. **Analytics**: Track conversation metrics and user satisfaction
