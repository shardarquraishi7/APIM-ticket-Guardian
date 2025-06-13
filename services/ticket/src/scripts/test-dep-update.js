// Script to test the DEP file update functionality
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function testDEPUpdate() {
  try {
    // Path to the sample DEP file
    const sampleFilePath = path.join(process.cwd(), 'src', 'sample-data', 'DEP.xlsx');
    
    // Create a copy of the sample file for testing
    const testFilePath = path.join(process.cwd(), 'src', 'uploads', `test-update-${Date.now()}.xlsx`);
    fs.copyFileSync(sampleFilePath, testFilePath);
    console.log(`Created test file at: ${testFilePath}`);
    
    // Read the test file to get the structure
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(testFilePath);
    
    // Get the questions sheet (sheet 2)
    const questionsSheet = workbook.getWorksheet(2);
    if (!questionsSheet) {
      throw new Error('Questions sheet not found in the XLSX file');
    }
    
    // Define column indices based on the actual structure
    const COL_QUESTION = 1;      // Column A: Question
    const COL_UNIQUE_ID = 3;     // Column C: Unique Identifier
    const COL_RESPONSE = 5;      // Column E: Response
    
    // Collect all questions to update
    const questionsToUpdate = [];
    questionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9) { // Process all data rows (data starts at row 9)
        const questionText = row.getCell(COL_QUESTION).text.trim();
        const uniqueId = row.getCell(COL_UNIQUE_ID).text.trim();
        const currentResponse = row.getCell(COL_RESPONSE).text.trim();
        
        if (questionText && uniqueId) {
          questionsToUpdate.push({
            id: questionText,
            uniqueId: uniqueId,
            currentResponse: currentResponse,
            answer: `Test answer for ${questionText} at ${new Date().toISOString()}`
          });
        }
      }
    });
    
    console.log(`\nCollected ${questionsToUpdate.length} questions to update`);
    
    // Display the questions to update
    console.log('\nQuestions to update:');
    questionsToUpdate.forEach((q, index) => {
      console.log(`${index + 1}. ${q.id} (${q.uniqueId})`);
      console.log(`   Current response: "${q.currentResponse || 'empty'}"`);
      console.log(`   New answer: "${q.answer}"`);
    });
    
    // Update the answers in the sheet
    console.log('\nUpdating answers in the sheet...');
    
    // Create maps of question IDs and unique IDs to their updated answers
    const answersByQuestionId = new Map();
    const answersByUniqueId = new Map();
    
    questionsToUpdate.forEach(q => {
      answersByQuestionId.set(q.id, q.answer);
      answersByUniqueId.set(q.uniqueId, q.answer);
    });
    
    // Update the answers in the sheet
    let updatedCount = 0;
    questionsSheet.eachRow((row, rowNumber) => {
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
    
    // Save the updated workbook
    const updatedFilePath = path.join(process.cwd(), 'src', 'uploads', `test-update-${Date.now()}-updated.xlsx`);
    await workbook.xlsx.writeFile(updatedFilePath);
    console.log(`Updated file saved to ${updatedFilePath}`);
    
    // Verify the updates
    console.log('\nVerifying updates...');
    const verifyWorkbook = new ExcelJS.Workbook();
    await verifyWorkbook.xlsx.readFile(updatedFilePath);
    
    const verifySheet = verifyWorkbook.getWorksheet(2);
    if (!verifySheet) {
      throw new Error('Questions sheet not found in the updated XLSX file');
    }
    
    let verifiedCount = 0;
    verifySheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9) { // Skip header rows (data starts at row 9)
        const questionText = row.getCell(COL_QUESTION).text.trim();
        const uniqueId = row.getCell(COL_UNIQUE_ID).text.trim();
        const response = row.getCell(COL_RESPONSE).text.trim();
        
        // Check if this is a question we updated
        const updatedQuestion = questionsToUpdate.find(q => q.uniqueId === uniqueId || q.id === questionText);
        
        if (updatedQuestion && response === updatedQuestion.answer) {
          verifiedCount++;
        }
      }
    });
    
    console.log(`Verified ${verifiedCount} out of ${updatedCount} updates`);
    
    if (verifiedCount === updatedCount) {
      console.log('\nTest completed successfully! All updates were verified.');
    } else {
      console.log('\nTest completed with issues. Some updates could not be verified.');
    }
    
  } catch (error) {
    console.error('Error testing DEP update:', error);
  }
}

testDEPUpdate();
