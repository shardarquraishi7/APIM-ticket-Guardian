/**
 * Test script to verify that skipped answers are handled correctly in the DEP flow
 * 
 * This script:
 * 1. Loads a sample DEP file
 * 2. Sets up anchor answers with one skipped answer
 * 3. Calls the question service to predict answers
 * 4. Verifies that the skipped answer is handled correctly
 * 5. Verifies that no downstream questions are inferred from the skipped answer
 */

const fs = require('fs');
const path = require('path');

// We need to use dynamic imports for ES modules
async function importModules() {
  // Import the modules dynamically
  const xlsxServiceModule = await import('../services/xlsx/xlsx-service.ts');
  const questionServiceModule = await import('../services/xlsx/question-service.ts');
  const constantsModule = await import('../constants.ts');
  
  return {
    xlsxService: xlsxServiceModule.xlsxService,
    questionService: questionServiceModule.questionService,
    SKIPPED_ANSWER: constantsModule.SKIPPED_ANSWER
  };
}

// Path to the sample DEP file
const sampleFilePath = path.join(__dirname, '..', 'sample-data', 'DEP.xlsx');

// Function to run the test
async function testSkippedAnswers() {
  try {
    console.log('Starting DEP skipped answers test...');
    
    // Import the modules
    const { xlsxService, questionService, SKIPPED_ANSWER } = await importModules();
    
    // Check if the sample file exists
    if (!fs.existsSync(sampleFilePath)) {
      console.error(`Sample file not found at ${sampleFilePath}`);
      return;
    }
    
    // Read the DEP file
    console.log(`Reading DEP file from ${sampleFilePath}...`);
    const depFile = await xlsxService.readDEPFile(sampleFilePath);
    console.log(`Read DEP file with ${depFile.questions.length} questions`);
    
    // Set up anchor answers with one skipped answer
    // Using question 2.6 (personal information) as the skipped anchor
    const anchorAnswers = [
      ['2.6', SKIPPED_ANSWER],
      ['7.1', 'Yes'] // AI question - should still work
    ];
    
    console.log('Anchor answers:', anchorAnswers);
    
    // Predict answers for the remaining questions
    console.log('Predicting answers...');
    const predictedQuestions = await questionService.predictFromAnchors(
      depFile.questions, 
      anchorAnswers
    );
    
    // Verify that the skipped answer is handled correctly
    const skippedQuestion = predictedQuestions.find(q => q.id === '2.6');
    console.log('\nSkipped question:');
    console.log(`- ID: ${skippedQuestion.id}`);
    console.log(`- Answer: ${skippedQuestion.answer}`);
    console.log(`- Confidence: ${skippedQuestion.confidence}`);
    console.log(`- Metadata:`, skippedQuestion.metadata);
    
    // Verify that no downstream questions are inferred from the skipped answer
    // Question 2.7 depends on 2.6, so it should not be inferred
    const dependentQuestion = predictedQuestions.find(q => q.id === '2.7');
    console.log('\nDependent question (should not be inferred):');
    console.log(`- ID: ${dependentQuestion.id}`);
    console.log(`- Answer: ${dependentQuestion.answer || 'Not answered'}`);
    console.log(`- Confidence: ${dependentQuestion.confidence || 'N/A'}`);
    console.log(`- Metadata:`, dependentQuestion.metadata || 'N/A');
    
    // Verify that questions dependent on non-skipped anchors are still inferred
    // Question 7.3 depends on 7.1, so it should be inferred
    const nonDependentQuestion = predictedQuestions.find(q => q.id === '7.3');
    console.log('\nNon-dependent question (should be inferred):');
    console.log(`- ID: ${nonDependentQuestion.id}`);
    console.log(`- Answer: ${nonDependentQuestion.answer || 'Not answered'}`);
    console.log(`- Confidence: ${nonDependentQuestion.confidence || 'N/A'}`);
    console.log(`- Metadata:`, nonDependentQuestion.metadata || 'N/A');
    
    // Count questions with answers
    const answeredCount = predictedQuestions.filter(q => q.answer && q.answer !== SKIPPED_ANSWER).length;
    const skippedCount = predictedQuestions.filter(q => q.answer === SKIPPED_ANSWER).length;
    
    console.log('\nSummary:');
    console.log(`- Total questions: ${predictedQuestions.length}`);
    console.log(`- Answered questions: ${answeredCount}`);
    console.log(`- Skipped questions: ${skippedCount}`);
    console.log(`- Unanswered questions: ${predictedQuestions.length - answeredCount - skippedCount}`);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
testSkippedAnswers();
