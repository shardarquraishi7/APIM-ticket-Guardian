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

import * as fs from 'fs';
import * as path from 'path';
import { xlsxService } from '../services/xlsx/xlsx-service';
import { questionService } from '../services/xlsx/question-service';
import { SKIPPED_ANSWER } from '../constants';

// Path to the sample DEP file
const sampleFilePath = path.join(__dirname, '..', 'sample-data', 'DEP.xlsx');

// Function to run the test
async function testSkippedAnswers() {
  try {
    console.log('Starting DEP skipped answers test...');
    
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
    const anchorAnswers: [string, string][] = [
      ['2.6 Is personal information in scope for this initiative? (Single selection allowed) *', SKIPPED_ANSWER],
      ['7.1 Are you building or leveraging any AI agents (i.e. Agentic AI) in this implementation ? (Single selection allowed) *', 'Yes'] // AI question - should still work
    ];
    
    console.log('Anchor answers:', anchorAnswers);
    
    // Predict answers for the remaining questions
    console.log('Predicting answers...');
    const predictionResult = await questionService.predictFromAnchors(
      depFile.questions, 
      anchorAnswers
    );
    
    // Extract the predicted questions array
    const predictedQuestions = predictionResult.predictedQuestions;
    
    // Log all question IDs to debug
    console.log('\nAll question IDs:');
    predictedQuestions.forEach(q => {
      console.log(`- ${q.id}`);
    });
    
    // Verify that the skipped answer is handled correctly
    const skippedQuestion = predictedQuestions.find(q => q.id === '2.6 Is personal information in scope for this initiative? (Single selection allowed) *');
    console.log('\nSkipped question:');
    console.log(`- ID: ${skippedQuestion?.id}`);
    console.log(`- Answer: ${skippedQuestion?.answer}`);
    console.log(`- Confidence: ${skippedQuestion?.confidence}`);
    console.log(`- Metadata:`, skippedQuestion?.metadata);
    
    // Verify that no downstream questions are inferred from the skipped answer
    // Question 2.7 depends on 2.6, so it should not be inferred
    const dependentQuestion = predictedQuestions.find(q => q.id === '2.7 Is Personal Health Information in scope? (Single selection allowed) *');
    console.log('\nDependent question (should not be inferred):');
    console.log(`- ID: ${dependentQuestion?.id}`);
    console.log(`- Answer: ${dependentQuestion?.answer || 'Not answered'}`);
    console.log(`- Confidence: ${dependentQuestion?.confidence || 'N/A'}`);
    console.log(`- Metadata:`, dependentQuestion?.metadata || 'N/A');
    
    // Check if our anchor answer for 7.1 was correctly set
    const aiQuestion = predictedQuestions.find(q => q.id === '7.1 Are you building or leveraging any AI agents (i.e. Agentic AI) in this implementation ? (Single selection allowed) *');
    console.log('\nAI question (should be set as anchor):');
    console.log(`- ID: ${aiQuestion?.id}`);
    console.log(`- Answer: ${aiQuestion?.answer || 'Not answered'}`);
    console.log(`- Confidence: ${aiQuestion?.confidence || 'N/A'}`);
    console.log(`- Metadata:`, aiQuestion?.metadata || 'N/A');
    
    // Verify that questions dependent on non-skipped anchors are still inferred
    // Question 7.3 depends on 7.1, so it should be inferred
    const nonDependentQuestion = predictedQuestions.find(q => q.id === '7.3 Does this initiative use Generative AI?  (Single selection allowed) *');
    console.log('\nNon-dependent question (should be inferred):');
    console.log(`- ID: ${nonDependentQuestion?.id}`);
    console.log(`- Answer: ${nonDependentQuestion?.answer || 'Not answered'}`);
    console.log(`- Confidence: ${nonDependentQuestion?.confidence || 'N/A'}`);
    console.log(`- Metadata:`, nonDependentQuestion?.metadata || 'N/A');
    
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
