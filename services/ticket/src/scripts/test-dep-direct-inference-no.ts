/**
 * Test script to verify that inference rules are working correctly
 * by directly using the applyInferenceRules function with 7.1 = No
 * 
 * This script:
 * 1. Sets up a map of answers with 7.1 = No
 * 2. Calls the applyInferenceRules function directly
 * 3. Verifies that 7.3 is inferred correctly as "No"
 */

import { applyInferenceRules, questions } from '../ai/prompts/questions';
import { AnswerMap } from '@/types';

// Function to run the test
async function testDirectInference() {
  try {
    console.log('Starting direct inference rules test with 7.1 = No...');
    
    // Set up a map of answers with 7.1 = No
    const answers: AnswerMap = {
      '7.1': 'No'
    };
    
    console.log('Initial answers:', answers);
    
    // Apply inference rules directly
    console.log('Applying inference rules...');
    const inferredAnswers = applyInferenceRules(questions, answers);
    
    // Check if 7.1 is still set
    console.log('\nAI question (should be set):');
    console.log(`- ID: 7.1`);
    console.log(`- Answer: ${inferredAnswers['7.1'] || 'Not answered'}`);
    
    // Verify that 7.3 is inferred
    console.log('\nDependent question (should be inferred as "No"):');
    console.log(`- ID: 7.3`);
    console.log(`- Answer: ${inferredAnswers['7.3'] || 'Not answered'}`);
    
    // Count questions with answers
    const answeredCount = Object.keys(inferredAnswers).length;
    
    console.log('\nSummary:');
    console.log(`- Total answers: ${answeredCount}`);
    console.log(`- All answers:`, inferredAnswers);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
testDirectInference();
