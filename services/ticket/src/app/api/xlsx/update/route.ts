import { NextRequest, NextResponse } from 'next/server';
import { XlsxService, xlsxService } from '@/services/xlsx/xlsx-service';
import { createLogger } from '@/lib/logger';
import fs from 'fs';

const logger = createLogger('xlsx-update-api');

/**
 * API route for updating XLSX files with new answers
 * @param request - The incoming request
 * @returns Response with the updated file path
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, questions } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Invalid questions data' },
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

    // Update the file with new answers
    const updatedFilePath = await xlsxService.updateDEPFile(filePath, questions);

    // Return the updated file path
    return NextResponse.json({
      success: true,
      updatedFilePath,
    });
  } catch (error: any) {
    logger.error('Error updating XLSX file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update XLSX file' },
      { status: 500 }
    );
  }
}

/**
 * API route for downloading an updated XLSX file
 * @param request - The incoming request
 * @returns Response with the file stream
 */
export async function GET(request: NextRequest) {
  try {
    const filePath = request.nextUrl.searchParams.get('filePath');

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
    
    // Create a response with the file
    const response = new NextResponse(fileBuffer);
    
    // Set appropriate headers
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="${filePath.split('/').pop()}"`);
    
    return response;
  } catch (error: any) {
    logger.error('Error downloading XLSX file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download XLSX file' },
      { status: 500 }
    );
  }
}
