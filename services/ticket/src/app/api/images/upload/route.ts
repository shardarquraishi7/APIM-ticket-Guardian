import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const logger = createLogger('images-upload-api');

/**
 * API route for uploading images for DEP questions
 */
export async function POST(req: NextRequest) {
  try {
    // Get the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const questionId = formData.get('questionId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!questionId) {
      return NextResponse.json({ error: 'No question ID provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are supported.' 
      }, { status: 400 });
    }
    
    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: 'File size exceeds 10MB limit' 
      }, { status: 400 });
    }
    
    // Create a safe filename
    const originalName = file.name;
    const safeQuestionId = questionId.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const fileName = `${safeQuestionId}_${timestamp}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Define the upload directory
    const uploadDir = join(process.cwd(), 'src', 'uploads', 'images', safeQuestionId);
    
    // Create the directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Define the file path
    const filePath = join(uploadDir, fileName);
    
    // Convert the file to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write the file to disk
    await writeFile(filePath, buffer);
    
    // Create a URL for the file
    const fileUrl = `/uploads/images/${safeQuestionId}/${fileName}`;
    
    logger.info(`Image uploaded for question ${questionId}: ${filePath}`);
    
    // Return the file information
    return NextResponse.json({
      success: true,
      fileName: originalName,
      filePath,
      fileUrl
    });
  } catch (error: any) {
    logger.error('Error uploading image:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
