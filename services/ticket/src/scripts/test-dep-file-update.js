// Script to test the DEP file update functionality directly
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Test the DEP file update functionality directly
 * This script:
 * 1. Creates a copy of the sample DEP file
 * 2. Updates answers for selected questions
 * 3. Verifies the updates were successful
 * 4. Tests edge cases like special characters and long answers
 */
async function testDEPFileUpdate() {
  try {
    // Path to the sample DEP file
    const sampleFilePath = path.join(process.cwd(), 'src', 'sample-data', 'DEP.xlsx');
    
    // Verify the sample file exists
    if (!fs.existsSync(sampleFilePath)) {
      throw new Error(`Sample file not found at: ${sampleFilePath}`);
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'src', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create a copy of the sample file for testing
    const testFilePath = path.join(uploadsDir, `test-direct-update-${Date.now()}.xlsx`);
    fs.copyFileSync(sampleFilePath, testFilePath);
    console.log(`Created test file at: ${testFilePath}`);
    
    // Create a backup of the test file
    const backupFilePath = `${testFilePath}.backup`;
    fs.copyFileSync(testFilePath, backupFilePath);
    console.log(`Created backup file at: ${backupFilePath}`);
    
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
    
    // Collect a few questions to update
    const questionsToUpdate = [];
    questionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9 && rowNumber <= 18) { // Get 10 sample questions
        const questionText = row.getCell(COL_QUESTION).text.trim();
        const uniqueId = row.getCell(COL_UNIQUE_ID).text.trim();
        const currentResponse = row.getCell(COL_RESPONSE).text.trim();
        
        if (questionText && uniqueId) {
          questionsToUpdate.push({
            id: questionText,
            uniqueId: uniqueId,
            currentResponse: currentResponse,
            answer: `Direct update test for ${questionText} at ${new Date().toISOString()}`
          });
        }
      }
    });
    
    // Add edge case tests
    
    // 1. Test with special characters
    if (questionsToUpdate.length > 0) {
      questionsToUpdate[0].answer = "Special chars: !@#$%^&*()_+<>?:\"{}|~`-=[]\\;',./";
      console.log(`Added special character test for question: ${questionsToUpdate[0].id}`);
    }
    
    // 2. Test with a very long answer
    if (questionsToUpdate.length > 1) {
      questionsToUpdate[1].answer = "This is a very long answer that tests the cell's capacity to handle large amounts of text. ".repeat(10);
      console.log(`Added long text test for question: ${questionsToUpdate[1].id}`);
    }
    
    // 3. Test with HTML-like content
    if (questionsToUpdate.length > 2) {
      questionsToUpdate[2].answer = "<div>This answer contains <strong>HTML-like</strong> content to test <em>escaping</em> and rendering.</div>";
      console.log(`Added HTML content test for question: ${questionsToUpdate[2].id}`);
    }
    
    // 4. Test with multi-line content
    if (questionsToUpdate.length > 3) {
      questionsToUpdate[3].answer = "This answer\ncontains\nmultiple\nline\nbreaks\nto test\nformatting.";
      console.log(`Added multi-line test for question: ${questionsToUpdate[3].id}`);
    }
    
    console.log(`\nCollected ${questionsToUpdate.length} questions to update`);
    
    // Display the questions to update
    console.log('\nQuestions to update:');
    questionsToUpdate.forEach((q, index) => {
      console.log(`${index + 1}. ${q.id} (${q.uniqueId})`);
      console.log(`   Current response: "${q.currentResponse || 'empty'}"`);
      console.log(`   New answer: "${q.answer}"`);
    });
    
    // Update the answers in the sheet directly
    console.log('\nUpdating answers in the sheet directly...');
    
    // Update the answers in the sheet
    let updatedCount = 0;
    questionsSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9) { // Skip header rows (data starts at row 9)
        const questionText = row.getCell(COL_QUESTION).text.trim();
        const uniqueId = row.getCell(COL_UNIQUE_ID).text.trim();
        
        // Find the matching question
        const questionToUpdate = questionsToUpdate.find(q => 
          q.uniqueId === uniqueId || q.id === questionText
        );
        
        if (questionToUpdate) {
          const currentResponse = row.getCell(COL_RESPONSE).text.trim();
          
          // Update the answer cell in column E (Response)
          row.getCell(COL_RESPONSE).value = questionToUpdate.answer;
          updatedCount++;
          console.log(`Updated answer for question: ${questionText} (${uniqueId})`);
          console.log(`   Old: "${currentResponse || 'empty'}"`);
          console.log(`   New: "${questionToUpdate.answer}"`);
        }
      }
    });
    
    console.log(`\nUpdated ${updatedCount} answers in the DEP file directly`);
    
    // Save the updated workbook to the same file
    await workbook.xlsx.writeFile(testFilePath);
    console.log(`Updated file saved back to ${testFilePath}`);
    
    // Verify the updates
    console.log('\nVerifying updates...');
    const verifyWorkbook = new ExcelJS.Workbook();
    await verifyWorkbook.xlsx.readFile(testFilePath);
    
    const verifySheet = verifyWorkbook.getWorksheet(2);
    if (!verifySheet) {
      throw new Error('Questions sheet not found in the updated XLSX file');
    }
    
    let verifiedCount = 0;
    const verificationFailures = [];
    
    verifySheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 9) { // Skip header rows (data starts at row 9)
        const questionText = row.getCell(COL_QUESTION).text.trim();
        const uniqueId = row.getCell(COL_UNIQUE_ID).text.trim();
        const response = row.getCell(COL_RESPONSE).text.trim();
        
        // Check if this is a question we updated
        const updatedQuestion = questionsToUpdate.find(q => q.uniqueId === uniqueId || q.id === questionText);
        
        if (updatedQuestion) {
          if (response === updatedQuestion.answer) {
            verifiedCount++;
          } else {
            // Record verification failure
            verificationFailures.push({
              id: questionText,
              uniqueId,
              expected: updatedQuestion.answer,
              actual: response
            });
          }
        }
      }
    });
    
    console.log(`Verified ${verifiedCount} out of ${updatedCount} updates`);
    
    if (verifiedCount === updatedCount) {
      console.log('\nTest completed successfully! All updates were verified.');
    } else {
      console.log('\nTest completed with issues. Some updates could not be verified:');
      
      // Display verification failures
      verificationFailures.forEach((failure, index) => {
        console.log(`\nFailure #${index + 1}: ${failure.id} (${failure.uniqueId})`);
        console.log(`Expected: "${failure.expected}"`);
        console.log(`Actual:   "${failure.actual}"`);
        
        // Try to identify the issue
        if (failure.actual === '') {
          console.log('Issue: Cell is empty - value was not saved');
        } else if (failure.expected.includes('\n') && !failure.actual.includes('\n')) {
          console.log('Issue: Line breaks were not preserved');
        } else if (failure.expected.length > 255 && failure.actual.length < failure.expected.length) {
          console.log('Issue: Text was truncated - possibly exceeded cell capacity');
        } else if (failure.expected.includes('<') && failure.actual !== failure.expected) {
          console.log('Issue: HTML-like content was not preserved correctly');
        } else if (failure.expected.includes('!@#$%') && failure.actual !== failure.expected) {
          console.log('Issue: Special characters were not preserved correctly');
        }
      });
      
      // Restore from backup if verification failed
      console.log('\nRestoring from backup...');
      fs.copyFileSync(backupFilePath, testFilePath);
      console.log(`Restored file from backup at: ${backupFilePath}`);
    }
    
    // Clean up backup file
    try {
      fs.unlinkSync(backupFilePath);
      console.log(`Deleted backup file: ${backupFilePath}`);
    } catch (cleanupError) {
      console.warn(`Warning: Could not delete backup file: ${cleanupError.message}`);
    }
    
  } catch (error) {
    console.error('Error testing DEP update:', error);
  }
}

testDEPFileUpdate();
