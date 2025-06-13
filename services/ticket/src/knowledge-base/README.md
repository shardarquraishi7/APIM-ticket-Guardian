# DEP Knowledge Base

This directory contains the knowledge base for the DEP Guardian AI assistant. The knowledge base is organized into three main categories:

1. **dep-process**: Information about the DEP process, including the overall workflow, questionnaire, and key steps.
2. **risk-assessment**: Information about risk assessment, including frameworks, common risks, and mitigation strategies.
3. **roles**: Information about the roles involved in the DEP process, including Data Stewards, Directors, DEP Deputies, and Team Members.

## Directory Structure

```
knowledge-base/
├── dep-process/       # DEP process information
├── risk-assessment/   # Risk assessment information
├── roles/             # Role-specific information
└── pdfs/              # Source PDF documents
```

## Knowledge Base Content

The knowledge base contains markdown files extracted from official DEP documentation, including:

- DEP Program Playbook
- Data Steward Job Aid
- DEP SME Training materials

Each markdown file contains a section of content from these documents, organized by topic.

## How It Works

1. **PDF Processing**: Source PDF documents are processed and split into chunks using the `pdf-processor.ts` utility.
2. **Markdown Generation**: The chunks are saved as markdown files in the appropriate category directories.
3. **Vector Database**: The markdown files are embedded and stored in a vector database for semantic search.
4. **AI Integration**: The DEP Guardian AI uses the `getInformation` tool to search the knowledge base when answering questions.

## Updating the Knowledge Base

To update the knowledge base:

1. Add new PDF documents to the `pdfs` directory.
2. Run `npm run kb:process` to process the PDFs and generate markdown files.
3. Run `npm run kb:sync` to sync the knowledge base with the vector database.

Alternatively, you can manually create or edit markdown files in the category directories.

## Sample Knowledge Base

For development and testing purposes, you can create a sample knowledge base with example content using:

```
npm run kb:sample
```

This will generate sample markdown files in each category directory.
