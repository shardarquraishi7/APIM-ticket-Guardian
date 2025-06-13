import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

const logger = createLogger('api-docs-upload');

// Define the uploads directory path
const UPLOADS_DIR = path.join(process.cwd(), 'src', 'uploads', 'api-docs');

// Ensure the uploads directory exists
if (typeof window === 'undefined' && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * API route for uploading API documentation files (JSON or XLSX)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if the request is a multipart form
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Only Excel (.xlsx) or JSON (.json) files are allowed' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a unique filename to avoid collisions
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    // Write the file to disk
    await fs.promises.writeFile(filePath, buffer);
    logger.info(`File saved to ${filePath}`);

    // Validate that the file was saved successfully
    if (!fs.existsSync(filePath)) {
      logger.error(`File was not saved successfully at ${filePath}`);
      return NextResponse.json(
        { error: 'Failed to save file to disk' },
        { status: 500 }
      );
    }

    // Process the file based on its type
    let fileData: any = {};
    
    if (file.name.endsWith('.json')) {
      try {
        // Read and parse the JSON file
        const jsonContent = await fs.promises.readFile(filePath, 'utf8');
        fileData = JSON.parse(jsonContent);
        logger.info(`Successfully parsed JSON file: ${file.name}`);
      } catch (error) {
        logger.error('Error parsing JSON file:', error);
        return NextResponse.json(
          { error: 'Failed to parse JSON file' },
          { status: 400 }
        );
      }
    } else if (file.name.endsWith('.xlsx')) {
      // For XLSX files, we'll just return the file path and let the client
      // make a separate request to process it if needed
      fileData = {
        message: 'XLSX file uploaded successfully. Use the analyze endpoint to process it.'
      };
    }

    // Return the file path and data
    return NextResponse.json({
      filePath,
      fileName: file.name,
      fileType: fileExtension.substring(1), // Remove the dot from extension
      fileData
    });
  } catch (error: any) {
    logger.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
