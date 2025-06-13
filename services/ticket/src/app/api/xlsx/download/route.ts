import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createLogger } from '@/lib/logger';

const logger = createLogger('api-xlsx-download');

/**
 * API route for downloading XLSX files
 */
export async function GET(request: NextRequest) {
  try {
    // Get the file path from the query parameters
    const url = new URL(request.url);
    const filePath = url.searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.promises.readFile(filePath);
    
    // Get the filename
    const fileName = path.basename(filePath);

    // Create a response with the file
    const response = new NextResponse(fileBuffer);
    
    // Set the content type and disposition headers
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return response;
  } catch (error: any) {
    logger.error('Error downloading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download file' },
      { status: 500 }
    );
  }
}
