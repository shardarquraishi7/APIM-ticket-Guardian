# DEP Guardian to API Ticketing Support Conversion Details

This document provides details on what was stripped and renamed during the conversion from DEP Guardian to API Ticketing Support.

## Stripped Components

The following components related to the DEP (Data Enablement Plan) process were stripped from the codebase:

1. **DEP-specific data models**:
   - DEP form data structures
   - DEP question templates
   - DEP approval workflows
   - DEP status tracking

2. **DEP-specific flows**:
   - DEP creation process
   - DEP approval process
   - DEP review cycles
   - DEP status updates

3. **DEP-specific UI components**:
   - DEP form components
   - DEP status indicators
   - DEP approval buttons
   - DEP review interfaces

4. **DEP-specific API endpoints**:
   - DEP creation endpoints
   - DEP update endpoints
   - DEP approval endpoints
   - DEP status endpoints

## Renamed Components

The following components were renamed to reflect the new "API Ticketing Support" branding:

| Original Name (DEP) | New Name (API Ticketing) |
|---------------------|--------------------------|
| DEPGuardian | APITicketingSupport |
| DEPChatbot | APITicketingChatbot |
| DEPKnowledgeBase | APITicketingKnowledgeBase |
| DEPVectorizer | TicketVectorizer |
| DEPEmbedder | TicketEmbedder |
| DEPQuestionService | TicketQuestionService |
| DEPFileMessage | TicketFileMessage |
| DEPQuestionMessage | TicketQuestionMessage |
| DEPImageUpload | TicketImageUpload |
| dep-process | api-ticketing-process |
| dep-analysis | api-ticketing-analysis |

## Preserved Components

The following components were preserved and remain unchanged:

1. **UI Layer**:
   - React components
   - Layout
   - Event handling
   - Styling

2. **Core Architecture**:
   - State management
   - Routing
   - Server endpoints
   - Error handling

3. **Integration Points**:
   - Feulix connector
   - OpenAI API integration
   - Authentication

## Modified Components

The following components were modified to support the new API Ticketing Support functionality:

1. **Vectorizer**:
   - Modified to ingest and index arbitrary JSON files
   - Modified to ingest and index XLSX spreadsheets
   - Updated to use API ticketing metadata

2. **Chat Interface**:
   - Wired to receive free-form user questions
   - Connected to the vectorizer and embeddings
   - Set up to query the knowledge base (JSON + XLSX)
   - Configured to call OpenAI for answer refinement
   - Updated to return answers in the existing chat UI

3. **System Prompts**:
   - Updated to focus on API ticketing workflows
   - Modified to handle complex, multi-step questions about API ticketing
   - Adjusted to provide information about error codes and service-level agreements

## Configuration Changes

The following configuration changes were made:

1. **Environment Variables**:
   - Added Turbopuffer configuration for vector storage
   - Updated OpenAI configuration to use Fuelix proxy

2. **Package Dependencies**:
   - Added @turbopuffer/turbopuffer for vector storage

3. **Scripts**:
   - Added sync:ticket-kb script for syncing the API ticketing knowledge base
   - Added convert:tickets script for converting Excel to JSON
