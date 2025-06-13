# API Ticketing Support System

This document provides an overview of the API Ticketing Support system, which has been converted from the DEP Guardian codebase. The system allows users to ask questions about API ticketing workflows, error codes, service-level agreements, and more.

## Overview

The API Ticketing Support system is a chatbot that uses vector embeddings and OpenAI's language models to provide answers to questions about API ticketing. The system ingests and indexes JSON files and Excel spreadsheets containing API ticketing information, and uses this knowledge base to answer user questions.

## Architecture

The system consists of the following components:

1. **UI Layer**: React components for the chat interface, file upload, and other UI elements.
2. **Core Architecture**: State management, routing, and server endpoints.
3. **Vectorizer**: A component that ingests and indexes JSON files and Excel spreadsheets.
4. **OpenAI Integration**: Integration with OpenAI's API for generating responses.
5. **Fuelix Connector**: Integration with Fuelix for proxy access to OpenAI.

## Data Flow

1. User uploads JSON files or Excel spreadsheets containing API ticketing information.
2. The vectorizer processes the files and creates embeddings for the content.
3. The embeddings are stored in a vector database.
4. User asks a question in the chat interface.
5. The question is embedded and used to search the vector database for relevant information.
6. The relevant information is sent to OpenAI along with the question to generate a response.
7. The response is displayed to the user in the chat interface.

## Feeding New Data

### JSON Files

To feed new JSON data into the vectorizer:

1. Place the JSON file in the `kb_source` directory.
2. The JSON file should have the following structure:
   ```json
   [
     {
       "id": "unique-id",
       "content": "The content of the document",
       "metadata": {
         "key1": "value1",
         "key2": "value2"
       }
     }
   ]
   ```
3. Run the sync script:
   ```bash
   npm run sync:ticket-kb
   ```

### Excel Spreadsheets

To feed new Excel data into the vectorizer:

1. Place the Excel file in the `kb_source` directory with the name `Copy of 2025 Ticket Count.xlsx`.
2. The Excel file should have sheets named after months (Jan, Feb, March, etc.).
3. Each sheet should have columns for:
   - Incident ID
   - Incident Summary
   - Incident Description
   - Submit Date
   - Last Resolved Date
   - Priority
   - Status
   - Category
   - Product Name
   - Resolution Note
4. Run the sync script:
   ```bash
   npm run sync:ticket-kb
   ```

## Development

### Running the Application

To run the application in development mode:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Implementation Notes

- The system uses mock embeddings in development mode to avoid making API calls to OpenAI.
- In production, the system would use the Turbopuffer SDK to store embeddings in the Fuelix vector store.
- The system is configured to use the Fuelix proxy for OpenAI API calls.

## Configuration

The system is configured using environment variables:

- `OPENAI_API_KEY`: The API key for OpenAI.
- `OPENAI_BASE_URL`: The base URL for the OpenAI API (Fuelix proxy).
- `VECTORS_API_KEY`: The API key for the vector store.
- `VECTORS_BASE_URL`: The base URL for the vector store.
- `VECTORS_USER_ID`: The user ID for the vector store.

These variables are defined in the `.env.development` file for development and should be set in the environment for production.
