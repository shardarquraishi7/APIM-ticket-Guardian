import { NextRequest, NextResponse } from 'next/server';
import { XlsxService, xlsxService } from '@/services/xlsx/xlsx-service';
import { createLogger } from '@/lib/logger';
import fs from 'fs';

const logger = createLogger('api-xlsx-upload');

/**
 * API route for uploading XLSX files
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
    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json(
        { error: 'Only Excel (.xlsx) files are allowed' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save the file
    const filePath = await xlsxService.saveUploadedFile(buffer, file.name);

    // Validate that the file was saved successfully
    if (!fs.existsSync(filePath)) {
      logger.error(`File was not saved successfully at ${filePath}`);
      return NextResponse.json(
        { error: 'Failed to save file to disk' },
        { status: 500 }
      );
    }

    // Return the file path
    return NextResponse.json({ filePath, fileName: file.name });
  } catch (error: any) {
    logger.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
