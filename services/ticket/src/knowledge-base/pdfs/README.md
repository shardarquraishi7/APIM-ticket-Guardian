# PDF Documents Directory

This directory is for storing PDF documents that will be processed and added to the knowledge base.

## Adding PDF Documents

To add a new document to the knowledge base:

1. Place the PDF file in this directory.
2. Name the file appropriately to indicate its content category:
   - Include "DEP Program Playbook" in the filename for general DEP process information
   - Include "Data Steward Job Aid" in the filename for role-specific information
   - Include "DEP SME Training" in the filename for risk assessment information

## Processing PDF Documents

After adding PDF files to this directory, run the following command to process them:

```
npm run kb:process
```

This will:
1. Extract text from the PDFs
2. Split the text into manageable chunks
3. Save the chunks as markdown files in the appropriate category directories

## Syncing with the Vector Database

After processing the PDFs, sync the knowledge base with the vector database:

```
npm run kb:sync
```

This will embed the markdown files and store them in the vector database for semantic search.

## Supported File Types

Currently, only PDF files are supported. The file names should have the `.pdf` extension.
