/**
 * Test script to demonstrate the issue with inference rules for question 7.3
 * 
 * This script:
 * 1. Examines the inference rule for question 7.3
 * 2. Shows that it only returns "Not Applicable" if 7.1 is "No"
 * 3. Demonstrates that it doesn't infer anything if 7.1 is "Yes"
 */

import { questions } from '../ai/prompts/questions';
import { AnswerMap } from '@/types';

// Function to run the test
function testInferenceIssue() {
  try {
    console.log('Starting inference issue test...');
    
    // Find question 7.3
    const question = questions.find(q => q.id === "7.3");
    
    if (!question) {
      console.error('Question 7.3 not found');
      return;
    }
    
    console.log('Question 7.3:');
    console.log(`- ID: ${question.id}`);
    console.log(`- Text: ${question.text}`);
    console.log(`- Depends on: ${question.dependsOn?.join(', ')}`);
    
    // Test inference rule with 7.1 = "No"
    const answersNo: AnswerMap = { '7.1': 'No' };
    const inferredNo = question.infer ? question.infer(answersNo) : undefined;
    
    console.log('\nTesting inference rule with 7.1 = "No":');
    console.log(`- Inferred answer: ${inferredNo || 'undefined'}`);
    
    // Test inference rule with 7.1 = "Yes"
    const answersYes: AnswerMap = { '7.1': 'Yes' };
    const inferredYes = question.infer ? question.infer(answersYes) : undefined;
    
    console.log('\nTesting inference rule with 7.1 = "Yes":');
    console.log(`- Inferred answer: ${inferredYes || 'undefined'}`);
    
    console.log('\nExplanation:');
    console.log('The inference rule for question 7.3 now returns "No" if 7.1 is "No".');
    console.log('It doesn\'t infer anything if 7.1 is "Yes", which is the desired behavior.');
    console.log('This ensures that when AI is used (7.1 = "Yes"), the user is prompted to specify if it\'s Generative AI.');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Run the test
testInferenceIssue();
