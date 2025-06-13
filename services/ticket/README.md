# API Ticketing Support Chatbot

This project is a conversion of the DEP Guardian codebase into an API Ticketing Support chatbot. It preserves the UI layer, core architecture, and integrations while removing DEP-specific functionality.

## Overview

The API Ticketing Support chatbot provides a conversational interface for users to:

- Get information about API documentation and usage
- Troubleshoot API errors and issues
- Create and manage API support tickets
- Learn about service level agreements (SLAs)

The system uses a vectorizer to ingest and index JSON and XLSX files containing API documentation and ticketing information, then leverages OpenAI to provide accurate and helpful responses.

## Key Components

- **Chat Interface**: React-based UI for user interactions
- **Vectorizer**: Processes and indexes API documentation files
- **OpenAI Integration**: Generates responses based on user queries and indexed knowledge
- **File Upload**: Supports JSON and XLSX file uploads for API documentation
- **Runbook Knowledge Base**: Pre-loaded API troubleshooting runbooks for common issues

## Changes from DEP Guardian

The following changes were made to convert DEP Guardian to API Ticketing Support:

### Removed Components

- DEP process-specific code and workflows
- DEP data models and schemas
- DEP-specific question handling
- DEP file processing logic

### Renamed Components

- "DEP Guardian" → "API Ticketing Support" (branding, UI elements)
- DEP-related class names, variables, and services → API Ticketing equivalents
- File upload labels and placeholders updated for API documentation

### Added Components

- API documentation file handling (JSON and XLSX)
- API ticketing middleware for processing API-related queries
- Sample API documentation and ticketing data
- API-specific knowledge base content

### Modified Components

- System prompt updated for API ticketing support
- File upload component modified to accept JSON and XLSX
- Vectorizer configured to handle API documentation
- Chat routing updated to use API ticketing middleware

## File Structure

- `src/ai/`: AI tools, prompts, and handlers
- `src/app/`: Next.js app structure and API routes
- `src/components/`: React components for the UI
- `src/sample-data/`: Sample API documentation and ticketing data
- `src/uploads/`: Directory for uploaded API documentation files

## Using the Chatbot

### Starting the Application

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000

### Pre-loaded Knowledge Base

The system comes with a pre-loaded knowledge base of API troubleshooting runbooks located at:
```
kb_source/improved_runbook_data.json
```

This knowledge base contains detailed troubleshooting steps for common API issues, including:
- Authentication problems (401 errors)
- Session token expiration
- Redis cache configuration
- Redirect URI mismatches
- Kong consumer synchronization
- DNS forwarding verification
- Gateway configuration issues
- Redirect loops
- And more

### Uploading API Documentation

1. Click the upload button in the chat interface
2. Select a JSON or XLSX file containing API documentation
3. The file will be processed and indexed
4. You can then ask questions about the uploaded documentation

### Sample Queries

- "What are the common API error codes?"
- "How do I create a new API support ticket?"
- "What is the SLA for P1 tickets?"
- "How do I authenticate with the API?"
- "What endpoints are available in the API?"
- "How do I fix a 401 unauthorized error?"
- "What causes session token expiration?"
- "How do I configure Redis cache for cookie storage?"
- "What should I do if I get a redirect URI mismatch?"
- "How do I resolve a 403 forbidden error due to missing Kong consumer?"

## Feeding New Data

### JSON Files

Upload JSON files with the following structure:

```json
{
  "info": {
    "title": "API Name",
    "description": "API Description"
  },
  "endpoints": [
    {
      "path": "/endpoint",
      "method": "GET",
      "summary": "Endpoint description"
    }
  ],
  "errors": [
    {
      "code": "400",
      "name": "BadRequest",
      "description": "Error description"
    }
  ]
}
```

### XLSX Files

Upload Excel files with sheets containing:

1. **Endpoints**: API endpoint documentation
2. **Errors**: Error code definitions
3. **SLAs**: Service level agreements
4. **Tickets**: Sample ticket data and workflows

## Development

### Key Files

- `src/ai/tools/get-information.ts`: Knowledge base access tool
- `src/app/api/chat/api-middleware.ts`: API ticketing middleware
- `src/app/api/api-docs/upload/route.ts`: File upload handler
- `src/app/api/api-docs/analyze/route.ts`: File analysis handler
- `src/components/multimodal-input.tsx`: Chat input with file upload
- `kb_source/improved_runbook_data.json`: Pre-loaded API troubleshooting runbooks

### Adding New Features

To extend the chatbot with new capabilities:

1. Add new AI tools in `src/ai/tools/`
2. Update the system prompt in `src/ai/prompts/system.ts`
3. Modify the chat route in `src/app/api/chat/route.ts`
4. Update the UI components as needed
