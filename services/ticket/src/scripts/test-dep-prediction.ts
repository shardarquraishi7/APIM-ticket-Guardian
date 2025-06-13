/**
 * Test script for DEP question prediction
 * 
 * This script tests the DEP question prediction functionality by:
 * 1. Loading a sample DEP file
 * 2. Selecting anchor questions
 * 3. Simulating user answers to those questions
 * 4. Predicting answers for the remaining questions
 * 5. Displaying the results
 */

import { createLogger } from '@/lib/logger';
import { questionService } from '@/services/xlsx/question-service';
import { XlsxService, xlsxService, QuestionData } from '@/services/xlsx/xlsx-service';
import fs from 'fs';
import path from 'path';

const logger = createLogger('test-dep-prediction');

async function main() {
  try {
    // Path to the sample DEP file
    const sampleFilePath = path.join(process.cwd(), 'src', 'sample-data', 'DEP.xlsx');
    
    // Check if the file exists
    if (!fs.existsSync(sampleFilePath)) {
      logger.error(`Sample file not found: ${sampleFilePath}`);
      return;
    }
    
    // Parse the DEP file
    const depFile = await xlsxService.readDEPFile(sampleFilePath);
    const questions = depFile.questions;
    logger.info(`Loaded ${questions.length} questions from sample DEP file`);
    
    // Select anchor questions
    const anchorQuestions = questionService.selectAnchorQuestions(questions, new Map(), 10);
    logger.info(`Selected ${anchorQuestions.length} anchor questions`);
    
    // Display the selected anchor questions
    console.log('\n=== Selected Anchor Questions ===');
    anchorQuestions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.id}: ${q.question}`);
    });
    
    // Simulate user answers to anchor questions
    const anchorAnswers = new Map<string, string>();
    
    // Simulate answers based on a typical scenario
    // Personal information is in scope
    anchorAnswers.set('2.6 Is personal information in scope for this initiative? (Single selection allowed) *', 'Yes');
    
    // No PHI
    anchorAnswers.set('2.7 Is personal health information (PHI) in scope for this initiative? (Single selection allowed) *', 'No');
    
    // Third party involvement
    anchorAnswers.set('13.1 Identify any third parties involved in this initiative (Multiple selections allowed) (Justification allowed) (Allows other) *', 'Yes, one third party');
    
    // No credit card data
    anchorAnswers.set('9.1 How is credit card data (including PAN, CVV, expiry date, etc.) processed in your initiative? (Single selection allowed) (Justification allowed) (Allows other) *', 'Not applicable / No credit card data involved');
    
    // Using AI
    anchorAnswers.set('7.1 Is your initiative building or leveraging AI agents? (Single selection allowed) *', 'Yes');
    
    // Using GenAI
    anchorAnswers.set('7.3 Does this initiative use Generative AI? (Single selection allowed) *', 'Yes');
    
    // No GDPR
    anchorAnswers.set('11.1 General Data Protection Regulation (GDPR)', 'None of these');
    
    // No minors
    anchorAnswers.set('4.5 Does your initiative collect or infer personal information of minors (under the age of majority)? (Single selection allowed) *', 'No');
    
    // Using Telus GenAI toolkit
    anchorAnswers.set('7.15 Are you using the TELUS Generative AI Toolkit? (Single selection allowed) *', 'Yes');
    
    // Project description
    anchorAnswers.set('1.1 Description *', 'This is a test project for DEP automation');
    
    // Display the simulated answers
    console.log('\n=== Simulated Anchor Answers ===');
    for (const [id, answer] of anchorAnswers.entries()) {
      console.log(`${id}: ${answer}`);
    }
    
    // Predict answers for the remaining questions
    const predictionResult = await questionService.predictFromAnchors(questions, anchorAnswers);
    
    // Extract the predicted questions array
    const predictedQuestions = predictionResult.predictedQuestions;
    
    // Count questions with answers
    const answeredCount = predictedQuestions.filter(q => q.answer && q.answer.trim() !== '').length;
    logger.info(`Predicted answers for ${answeredCount} out of ${questions.length} questions`);
    
    // Display a sample of predicted answers
    console.log('\n=== Sample of Predicted Answers ===');
    const sampleSize = Math.min(10, predictedQuestions.length);
    const sampleQuestions = predictedQuestions
      .filter(q => q.answer && q.answer.trim() !== '' && !anchorAnswers.has(q.id))
      .slice(0, sampleSize);
    
    sampleQuestions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.id}: ${q.question}`);
      console.log(`   Answer: ${q.answer} (Confidence: ${q.confidence?.toFixed(2)})`);
    });
    
    // Display confidence distribution
    console.log('\n=== Confidence Distribution ===');
    const confidenceRanges = {
      'High (0.8-1.0)': 0,
      'Medium (0.5-0.8)': 0,
      'Low (0.3-0.5)': 0,
      'Very Low (<0.3)': 0
    };
    
    predictedQuestions.forEach(q => {
      if (q.confidence !== undefined) {
        if (q.confidence >= 0.8) {
          confidenceRanges['High (0.8-1.0)']++;
        } else if (q.confidence >= 0.5) {
          confidenceRanges['Medium (0.5-0.8)']++;
        } else if (q.confidence >= 0.3) {
          confidenceRanges['Low (0.3-0.5)']++;
        } else {
          confidenceRanges['Very Low (<0.3)']++;
        }
      }
    });
    
    for (const [range, count] of Object.entries(confidenceRanges)) {
      console.log(`${range}: ${count} questions`);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error: any) {
    logger.error('Error running test:', error);
    console.error('Test failed:', error.message);
  }
}

// Run the test
main();
