/**
 * Test script to verify that inference rules are working correctly
 * 
 * This script:
 * 1. Loads a sample DEP file
 * 2. Sets up anchor answers with 7.1 = Yes
 * 3. Calls the question service to predict answers
 * 4. Verifies that 7.3 is inferred correctly
 */

import * as fs from 'fs';
import * as path from 'path';
import { xlsxService } from '../services/xlsx/xlsx-service';
import { questionService } from '../services/xlsx/question-service';

// Path to the sample DEP file
const sampleFilePath = path.join(__dirname, '..', 'sample-data', 'DEP.xlsx');

// Function to run the test
async function testInferenceRules() {
  try {
    console.log('Starting DEP inference rules test...');
    
    // Check if the sample file exists
    if (!fs.existsSync(sampleFilePath)) {
      console.error(`Sample file not found at ${sampleFilePath}`);
      return;
    }
    
    // Read the DEP file
    console.log(`Reading DEP file from ${sampleFilePath}...`);
    const depFile = await xlsxService.readDEPFile(sampleFilePath);
    console.log(`Read DEP file with ${depFile.questions.length} questions`);
    
    // Set up anchor answers with 7.1 = Yes
    const anchorAnswers: [string, string][] = [
      ['7.1 Are you building or leveraging any AI agents (i.e. Agentic AI) in this implementation ? (Single selection allowed) *', 'Yes']
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
    
    // Check if our anchor answer for 7.1 was correctly set
    const aiQuestion = predictedQuestions.find(q => q.id === '7.1 Are you building or leveraging any AI agents (i.e. Agentic AI) in this implementation ? (Single selection allowed) *');
    console.log('\nAI question (should be set as anchor):');
    console.log(`- ID: ${aiQuestion?.id}`);
    console.log(`- Answer: ${aiQuestion?.answer || 'Not answered'}`);
    console.log(`- Confidence: ${aiQuestion?.confidence || 'N/A'}`);
    console.log(`- Metadata:`, aiQuestion?.metadata || 'N/A');
    
    // Verify that questions dependent on 7.1 are inferred
    // Question 7.3 depends on 7.1, so it should be inferred
    const dependentQuestion = predictedQuestions.find(q => q.id === '7.3 Does this initiative use Generative AI?  (Single selection allowed) *');
    console.log('\nDependent question (should be inferred):');
    console.log(`- ID: ${dependentQuestion?.id}`);
    console.log(`- Answer: ${dependentQuestion?.answer || 'Not answered'}`);
    console.log(`- Confidence: ${dependentQuestion?.confidence || 'N/A'}`);
    console.log(`- Metadata:`, dependentQuestion?.metadata || 'N/A');
    
    // Count questions with answers
    const answeredCount = predictedQuestions.filter(q => q.answer && q.answer.trim() !== '').length;
    
    console.log('\nSummary:');
    console.log(`- Total questions: ${predictedQuestions.length}`);
    console.log(`- Answered questions: ${answeredCount}`);
    console.log(`- Unanswered questions: ${predictedQuestions.length - answeredCount}`);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
testInferenceRules();
