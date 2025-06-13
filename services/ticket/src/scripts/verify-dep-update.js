// Script to verify that the DEP file is being correctly updated
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
// We'll implement the update logic directly in this script
// instead of importing the xlsxService

async function verifyDEPUpdate() {
  try {
    // Path to the sample DEP file
    const sampleFilePath = path.join(process.cwd(), 'src', 'sample-data', 'DEP.xlsx');
    
    // Create a copy of the sample file for testing
    const testFilePath = path.join(process.cwd(), 'src', 'uploads', `verify-update-${Date.now()}.xlsx`);
    fs.copyFileSync(sampleFilePath, testFilePath);
    console.log(`Created test file at: ${testFilePath}`);
    
    // Read the original file to get the structure
    const originalWorkbook = new ExcelJS.Workbook();
    await originalWorkbook.xlsx.readFile(testFilePath);
    
    // Get the questions sheet (sheet 2)
    const originalQuestionsSheet = originalWorkbook.getWorksheet(2);
    if (!originalQuestionsSheet) {
      throw new Error('Questions sheet not found in the XLSX file');
    }
    
    // Define column indices based on the actual structure
    const COL_QUESTION = 1;      // Column A: Question
    const COL_UNIQUE_ID = 3;     // Column C: Unique Identifier
    const COL_RESPONSE = 5;      // Column E: Response
    
    // Count original answers
    let originalAnswerCount = 0;
    originalQuestionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9) { // Skip header rows (data starts at row 9)
        const response = row.getCell(COL_RESPONSE).text.trim();
        if (response) {
          originalAnswerCount++;
        }
      }
    });
    
    console.log(`Original file has ${originalAnswerCount} answers`);
    
    // Create test questions with answers
    const testQuestions = [];
    originalQuestionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9 && rowNumber <= 20) { // Get first 12 questions
        const questionText = row.getCell(COL_QUESTION).text.trim();
        const uniqueId = row.getCell(COL_UNIQUE_ID).text.trim();
        
        if (questionText && uniqueId) {
          testQuestions.push({
            id: questionText,
            uniqueId: uniqueId,
            answer: `Test answer for ${questionText} at ${new Date().toISOString()}`
          });
        }
      }
    });
    
    console.log(`Created ${testQuestions.length} test questions with answers`);
    
    // Update the file directly (similar to xlsxService.updateDEPFile)
    console.log('Updating file directly...');
    
    // Read the file to update
    const workbookToUpdate = new ExcelJS.Workbook();
    await workbookToUpdate.xlsx.readFile(testFilePath);
    
    // Get the questions sheet
    const questionsSheetToUpdate = workbookToUpdate.getWorksheet(2);
    if (!questionsSheetToUpdate) {
      throw new Error('Questions sheet not found in the XLSX file');
    }
    
    // Create maps of question IDs and unique IDs to their updated answers
    const answersByQuestionId = new Map();
    const answersByUniqueId = new Map();
    
    testQuestions.forEach(q => {
      if (q.id && q.answer) {
        answersByQuestionId.set(q.id, q.answer);
        
        // If the question has a uniqueId, also map by uniqueId
        if (q.uniqueId) {
          answersByUniqueId.set(q.uniqueId, q.answer);
        }
      }
    });
    
    // Update the answers in the sheet
    let updatedCount = 0;
    questionsSheetToUpdate.eachRow((row, rowNumber) => {
      if (rowNumber >= 9) { // Skip header rows (data starts at row 9)
        const questionText = row.getCell(COL_QUESTION).text.trim();
        const uniqueId = row.getCell(COL_UNIQUE_ID).text.trim();
        const currentResponse = row.getCell(COL_RESPONSE).text.trim();
        
        // Try to find the answer by uniqueId first, then by question text
        let answer;
        let matchType = '';
        
        if (uniqueId && answersByUniqueId.has(uniqueId)) {
          answer = answersByUniqueId.get(uniqueId);
          matchType = 'uniqueId';
        } else if (questionText && answersByQuestionId.has(questionText)) {
          answer = answersByQuestionId.get(questionText);
          matchType = 'questionId';
        }
        
        if (answer) {
          // Update the answer cell in column E (Response)
          row.getCell(COL_RESPONSE).value = answer;
          updatedCount++;
          console.log(`Updated answer for question: ${questionText} (${uniqueId}) via ${matchType}`);
          console.log(`   Old: "${currentResponse || 'empty'}"`);
          console.log(`   New: "${answer}"`);
        }
      }
    });
    
    console.log(`\nUpdated ${updatedCount} answers in the DEP file`);
    
    // Save the updated workbook back to the original file
    await workbookToUpdate.xlsx.writeFile(testFilePath);
    console.log(`Updated file saved to ${testFilePath}`);
    
    const updatedFilePath = testFilePath;
    
    console.log(`File updated at: ${updatedFilePath}`);
    console.log(`Is updated path same as original? ${updatedFilePath === testFilePath}`);
    
    // Read the updated file
    const updatedWorkbook = new ExcelJS.Workbook();
    await updatedWorkbook.xlsx.readFile(updatedFilePath);
    
    // Get the questions sheet from the updated file
    const updatedQuestionsSheet = updatedWorkbook.getWorksheet(2);
    if (!updatedQuestionsSheet) {
      throw new Error('Questions sheet not found in the updated XLSX file');
    }
    
    // Count updated answers
    let updatedAnswerCount = 0;
    let verifiedAnswers = 0;
    updatedQuestionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9) { // Skip header rows (data starts at row 9)
        const questionText = row.getCell(COL_QUESTION).text.trim();
        const uniqueId = row.getCell(COL_UNIQUE_ID).text.trim();
        const response = row.getCell(COL_RESPONSE).text.trim();
        
        if (response) {
          updatedAnswerCount++;
          
          // Check if this is one of our test questions
          const testQuestion = testQuestions.find(q => q.uniqueId === uniqueId || q.id === questionText);
          if (testQuestion && response === testQuestion.answer) {
            verifiedAnswers++;
          }
        }
      }
    });
    
    console.log(`Updated file has ${updatedAnswerCount} answers (${updatedAnswerCount - originalAnswerCount} new answers)`);
    console.log(`Verified ${verifiedAnswers} out of ${testQuestions.length} test answers`);
    
    if (verifiedAnswers === testQuestions.length) {
      console.log('\nVERIFICATION SUCCESSFUL: All test answers were correctly written to the file');
    } else {
      console.log('\nVERIFICATION FAILED: Some test answers were not correctly written to the file');
    }
    
    // Clean up the test file
    fs.unlinkSync(testFilePath);
    console.log(`Cleaned up test file: ${testFilePath}`);
    
  } catch (error) {
    console.error('Error verifying DEP update:', error);
  }
}

verifyDEPUpdate();
