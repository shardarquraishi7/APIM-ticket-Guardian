import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { openai } from '@/lib/openai';
import { CHAT_MODEL } from '@/constants';

const logger = createLogger('api-docs-analyze');

/**
 * API route for analyzing API documentation files
 */
export async function POST(request: NextRequest) {
  try {
    const { filePath, fileName } = await request.json();

    if (!filePath || !fileName) {
      return NextResponse.json(
        { error: 'File path and name are required' },
        { status: 400 }
      );
    }

    // Validate that the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Process the file based on its type
    let fileData: any = {};
    let analysisResult: any = {};
    
    if (fileName.endsWith('.json')) {
      try {
        // Read and parse the JSON file
        const jsonContent = await fs.promises.readFile(filePath, 'utf8');
        fileData = JSON.parse(jsonContent);
        
        // Analyze the JSON structure
        analysisResult = await analyzeJsonApiDocs(fileData);
      } catch (error) {
        logger.error('Error analyzing JSON file:', error);
        return NextResponse.json(
          { error: 'Failed to analyze JSON file' },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith('.xlsx')) {
      try {
        // Analyze the XLSX file
        analysisResult = await analyzeXlsxApiDocs(filePath);
      } catch (error) {
        logger.error('Error analyzing XLSX file:', error);
        return NextResponse.json(
          { error: 'Failed to analyze XLSX file' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Generate a response message
    const message = generateAnalysisMessage(fileName, analysisResult);

    // Return the analysis results
    return NextResponse.json({
      message,
      filePath,
      fileName,
      fileType: path.extname(fileName).substring(1),
      analysisResult,
      state: {
        filePath,
        fileName,
        isApiDocsFile: true,
        analysisComplete: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Error analyzing file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze file' },
      { status: 500 }
    );
  }
}

/**
 * Analyze a JSON API documentation file
 * @param jsonData - The parsed JSON data
 * @returns Analysis results
 */
async function analyzeJsonApiDocs(jsonData: any): Promise<any> {
  try {
    // Extract key information from the JSON structure
    const endpoints = extractEndpoints(jsonData);
    const errorCodes = extractErrorCodes(jsonData);
    const authMethods = extractAuthMethods(jsonData);
    
    // Use OpenAI to generate a summary of the API documentation
    const summary = await generateApiSummary(jsonData);
    
    return {
      endpoints,
      errorCodes,
      authMethods,
      summary,
      format: 'json'
    };
  } catch (error) {
    logger.error('Error in JSON analysis:', error);
    throw error;
  }
}

/**
 * Analyze an XLSX API documentation file
 * @param filePath - Path to the XLSX file
 * @returns Analysis results
 */
async function analyzeXlsxApiDocs(filePath: string): Promise<any> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Extract sheet names
    const sheetNames = workbook.worksheets.map(sheet => sheet.name);
    
    // Extract headers from each sheet
    const sheetHeaders: Record<string, string[]> = {};
    workbook.worksheets.forEach(sheet => {
      const headers: string[] = [];
      if (sheet.rowCount > 0) {
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          headers.push(cell.text);
        });
      }
      sheetHeaders[sheet.name] = headers;
    });
    
    // Extract data samples from each sheet
    const dataSamples: Record<string, any[]> = {};
    workbook.worksheets.forEach(sheet => {
      const samples: any[] = [];
      if (sheet.rowCount > 1) {
        // Get up to 5 data rows
        for (let rowNumber = 2; rowNumber <= Math.min(6, sheet.rowCount); rowNumber++) {
          const row = sheet.getRow(rowNumber);
          const rowData: Record<string, string> = {};
          row.eachCell((cell, colNumber) => {
            const header = sheetHeaders[sheet.name][colNumber - 1] || `Column ${colNumber}`;
            rowData[header] = cell.text;
          });
          samples.push(rowData);
        }
      }
      dataSamples[sheet.name] = samples;
    });
    
    // Use OpenAI to generate a summary of the XLSX data
    const summary = await generateXlsxSummary(sheetNames, sheetHeaders, dataSamples);
    
    return {
      sheetNames,
      sheetHeaders,
      dataSamples,
      summary,
      format: 'xlsx',
      rowCount: workbook.worksheets.reduce((total, sheet) => total + sheet.rowCount, 0)
    };
  } catch (error) {
    logger.error('Error in XLSX analysis:', error);
    throw error;
  }
}

/**
 * Extract API endpoints from JSON data
 * @param jsonData - The parsed JSON data
 * @returns Array of endpoints
 */
function extractEndpoints(jsonData: any): any[] {
  const endpoints: any[] = [];
  
  // Look for common API documentation structures
  // OpenAPI/Swagger format
  if (jsonData.paths) {
    Object.entries(jsonData.paths).forEach(([path, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, details]: [string, any]) => {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: details.summary || '',
          description: details.description || '',
          parameters: details.parameters || []
        });
      });
    });
  }
  
  // Custom format - look for endpoints array
  if (jsonData.endpoints && Array.isArray(jsonData.endpoints)) {
    jsonData.endpoints.forEach((endpoint: any) => {
      endpoints.push(endpoint);
    });
  }
  
  // If no endpoints found but we have a flat structure that might be a single endpoint
  if (endpoints.length === 0 && jsonData.url) {
    endpoints.push({
      path: jsonData.url,
      method: jsonData.method || 'GET',
      summary: jsonData.summary || jsonData.title || '',
      description: jsonData.description || ''
    });
  }
  
  return endpoints;
}

/**
 * Extract error codes from JSON data
 * @param jsonData - The parsed JSON data
 * @returns Array of error codes
 */
function extractErrorCodes(jsonData: any): any[] {
  const errorCodes: any[] = [];
  
  // Look for common error code structures
  if (jsonData.errors && Array.isArray(jsonData.errors)) {
    return jsonData.errors;
  }
  
  // OpenAPI/Swagger format
  if (jsonData.components && jsonData.components.responses) {
    Object.entries(jsonData.components.responses).forEach(([name, details]: [string, any]) => {
      if (name.includes('Error') || (details.description && details.description.includes('error'))) {
        errorCodes.push({
          code: name,
          description: details.description || ''
        });
      }
    });
  }
  
  return errorCodes;
}

/**
 * Extract authentication methods from JSON data
 * @param jsonData - The parsed JSON data
 * @returns Array of authentication methods
 */
function extractAuthMethods(jsonData: any): any[] {
  const authMethods: any[] = [];
  
  // OpenAPI/Swagger format
  if (jsonData.components && jsonData.components.securitySchemes) {
    Object.entries(jsonData.components.securitySchemes).forEach(([name, details]: [string, any]) => {
      authMethods.push({
        name,
        type: details.type || '',
        description: details.description || ''
      });
    });
  }
  
  // Look for auth or authentication fields
  if (jsonData.authentication) {
    if (Array.isArray(jsonData.authentication)) {
      return jsonData.authentication;
    } else {
      authMethods.push(jsonData.authentication);
    }
  }
  
  if (jsonData.auth) {
    if (Array.isArray(jsonData.auth)) {
      return jsonData.auth;
    } else {
      authMethods.push(jsonData.auth);
    }
  }
  
  return authMethods;
}

/**
 * Generate a summary of the API documentation using OpenAI
 * @param jsonData - The parsed JSON data
 * @returns Summary text
 */
async function generateApiSummary(jsonData: any): Promise<string> {
  try {
    // Create a simplified version of the JSON data to avoid token limits
    const simplifiedData = {
      info: jsonData.info || {},
      endpoints: extractEndpoints(jsonData).slice(0, 10), // Limit to 10 endpoints
      errorCodes: extractErrorCodes(jsonData),
      authMethods: extractAuthMethods(jsonData)
    };
    
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an API documentation expert. Analyze the provided API documentation and create a concise summary that explains the purpose of the API, key endpoints, authentication methods, and error handling.'
        },
        {
          role: 'user',
          content: `Please analyze this API documentation and provide a summary:\n${JSON.stringify(simplifiedData, null, 2)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    return completion.choices[0]?.message?.content || 'No summary available';
  } catch (error) {
    logger.error('Error generating API summary:', error);
    return 'Failed to generate API summary';
  }
}

/**
 * Generate a summary of the XLSX data using OpenAI
 * @param sheetNames - Array of sheet names
 * @param sheetHeaders - Record of sheet names to header arrays
 * @param dataSamples - Record of sheet names to data sample arrays
 * @returns Summary text
 */
async function generateXlsxSummary(
  sheetNames: string[],
  sheetHeaders: Record<string, string[]>,
  dataSamples: Record<string, any[]>
): Promise<string> {
  try {
    // Create a simplified representation of the XLSX structure
    const structure = sheetNames.map(name => ({
      sheet: name,
      headers: sheetHeaders[name],
      samples: dataSamples[name].slice(0, 2) // Limit to 2 samples per sheet
    }));
    
    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an API documentation expert. Analyze the provided Excel structure and create a concise summary that explains what kind of API documentation this appears to be, what information it contains, and how it might be used for API ticketing support.'
        },
        {
          role: 'user',
          content: `Please analyze this Excel structure and provide a summary:\n${JSON.stringify(structure, null, 2)}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    return completion.choices[0]?.message?.content || 'No summary available';
  } catch (error) {
    logger.error('Error generating XLSX summary:', error);
    return 'Failed to generate XLSX summary';
  }
}

/**
 * Generate a user-friendly message based on the analysis results
 * @param fileName - The name of the file
 * @param analysisResult - The analysis results
 * @returns Formatted message
 */
function generateAnalysisMessage(fileName: string, analysisResult: any): string {
  if (analysisResult.format === 'json') {
    const endpointCount = analysisResult.endpoints.length;
    const errorCount = analysisResult.errorCodes.length;
    const authCount = analysisResult.authMethods.length;
    
    return `
# API Documentation Analysis Complete

I've analyzed the JSON API documentation file **${fileName}** and found:

- **${endpointCount} API Endpoints**
- **${errorCount} Error Codes**
- **${authCount} Authentication Methods**

## Summary
${analysisResult.summary}

You can now ask me questions about this API documentation, such as:
- How to authenticate with this API
- What endpoints are available
- How to handle specific error codes
- Details about specific endpoints
`.trim();
  } else if (analysisResult.format === 'xlsx') {
    const sheetCount = analysisResult.sheetNames.length;
    const rowCount = analysisResult.rowCount;
    
    return `
# API Documentation Analysis Complete

I've analyzed the Excel file **${fileName}** and found:

- **${sheetCount} Worksheets**
- **${rowCount} Total Rows**

## Sheets
${analysisResult.sheetNames.map((name: string) => `- ${name} (${analysisResult.sheetHeaders[name].length} columns)`).join('\n')}

## Summary
${analysisResult.summary}

You can now ask me questions about the data in this Excel file, such as:
- What information is contained in specific sheets
- How to interpret the data for API ticketing
- Details about specific fields or values
`.trim();
  }
  
  return `Analysis of ${fileName} is complete. You can now ask me questions about this file.`;
}
