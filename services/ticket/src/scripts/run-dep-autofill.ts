#!/usr/bin/env ts-node

/**
 * Script to run DEP autofill functionality from the command line
 * 
 * This script:
 * 1. Takes a DEP file path as input
 * 2. Prompts the user for answers to the anchor questions
 * 3. Runs the inference algorithm to predict answers for all questions
 * 4. Updates the DEP file with the predicted answers
 * 5. Outputs statistics about the prediction
 * 
 * Usage:
 * ts-node src/scripts/run-dep-autofill.ts <dep-file-path>
 * 
 * Example:
 * ts-node src/scripts/run-dep-autofill.ts ./sample-data/DEP.xlsx
 */

import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { xlsxService } from '../services/xlsx/xlsx-service';
import { questionService } from '../services/xlsx/question-service';
import { createLogger } from '../lib/logger';
import { ANCHORS } from '../data/questions';
import { getQuestionById } from '../ai/prompts/questions';

const logger = createLogger('run-dep-autofill');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Function to prompt user for anchor question answers
async function promptForAnchorAnswers(anchorIds: string[]): Promise<[string, string][]> {
  const answers: [string, string][] = [];
  
  console.log('\nPlease answer the following anchor questions:\n');
  
  for (const id of anchorIds) {
    const questionObj = getQuestionById(id);
    
    if (!questionObj) {
      console.log(`Warning: Could not find question definition for ${id}, skipping...`);
      continue;
    }
    
    console.log(`\nQuestion ${id}: ${questionObj.text}`);
    
    if (questionObj.options && questionObj.options.length > 0) {
      console.log('Options:');
      questionObj.options.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option}`);
      });
      
      const answerIndex = await question('Enter option number: ');
      const index = parseInt(answerIndex, 10) - 1;
      
      if (index >= 0 && index < questionObj.options.length) {
        answers.push([id, questionObj.options[index]]);
      } else {
        console.log(`Invalid option, using default: ${questionObj.options[0]}`);
        answers.push([id, questionObj.options[0]]);
      }
    } else {
      const answer = await question('Enter your answer: ');
      answers.push([id, answer]);
    }
  }
  
  return answers;
}

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
      console.error('Usage: ts-node src/scripts/run-dep-autofill.ts <dep-file-path>');
      process.exit(1);
    }
    
    // Get the DEP file path
    const depFilePath = path.resolve(args[0]);
    
    // Check if the file exists
    if (!fs.existsSync(depFilePath)) {
      console.error(`Error: DEP file not found at ${depFilePath}`);
      process.exit(1);
    }
    
    console.log(`Running DEP autofill on ${depFilePath}`);
    
    // Read the DEP file
    const depFile = await xlsxService.readDEPFile(depFilePath);
    console.log(`Read DEP file with ${depFile.questions.length} questions`);
    console.log(`File has ${depFile.preExistingAnswers} pre-existing answers`);
    
    // Get existing answers from the file
    const existingAnswers = depFile.questions
      .filter(q => q.answer && q.answer.trim() !== '')
      .map(q => [q.id, q.answer] as [string, string]);
    
    console.log(`Found ${existingAnswers.length} existing answers in the file`);
    
    // Create a map of existing answers
    const existingAnswersMap = new Map<string, string>(existingAnswers);
    
    // Determine which anchor questions need to be answered
    const anchorQuestionsToAsk = ANCHORS.filter(id => {
      // Check if the question is already answered in the file
      return !existingAnswersMap.has(id);
    });
    
    console.log(`\nNeed to collect answers for ${anchorQuestionsToAsk.length} anchor questions`);
    
    // Prompt for anchor question answers
    const anchorAnswers = await promptForAnchorAnswers(anchorQuestionsToAsk);
    
    // Combine existing answers with new anchor answers
    const allAnchorAnswers = [...existingAnswers, ...anchorAnswers];
    
    console.log(`\nCollected ${allAnchorAnswers.length} anchor answers`);
    
    // Run the inference algorithm
    console.log('\nRunning inference algorithm...');
    const startTime = Date.now();
    
    const predictionResult = await questionService.predictFromAnchors(
      depFile.questions,
      allAnchorAnswers
    );
    
    // Extract the predicted questions array
    const predictedQuestions = predictionResult.predictedQuestions;
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Count questions with answers
    const answeredCount = predictedQuestions.filter(q => q.answer && q.answer.trim() !== '').length;
    console.log(`Predicted answers for ${answeredCount} out of ${depFile.questions.length} questions`);
    console.log(`Inference completed in ${duration.toFixed(2)} seconds`);
    
    // Update the DEP file with the predicted answers
    const outputFilePath = await xlsxService.updateDEPFile(depFilePath, predictedQuestions);
    console.log(`Updated file saved to ${outputFilePath}`);
    
    // Generate statistics by cluster
    console.log('\nStatistics by cluster:');
    
    // Group questions by cluster
    const clusterMap = new Map<string, { total: number, answered: number, confidence: number }>();
    
    for (const q of predictedQuestions) {
      // Extract cluster number from question ID (e.g., "2.6" -> "2")
      const clusterMatch = q.id.match(/^(\d+)\./);
      const cluster = clusterMatch ? clusterMatch[1] : 'unknown';
      
      // Initialize cluster stats if not exists
      if (!clusterMap.has(cluster)) {
        clusterMap.set(cluster, { total: 0, answered: 0, confidence: 0 });
      }
      
      // Update cluster stats
      const stats = clusterMap.get(cluster)!;
      stats.total++;
      
      if (q.answer && q.answer.trim() !== '') {
        stats.answered++;
        stats.confidence += q.confidence || 0;
      }
    }
    
    // Print cluster statistics
    for (const [cluster, stats] of clusterMap.entries()) {
      const percentAnswered = (stats.answered / stats.total * 100).toFixed(1);
      const avgConfidence = stats.answered > 0 ? (stats.confidence / stats.answered * 100).toFixed(1) : '0.0';
      console.log(`Cluster ${cluster}: ${stats.answered}/${stats.total} questions answered (${percentAnswered}%), avg confidence: ${avgConfidence}%`);
    }
    
    // Print overall statistics
    const percentAnswered = (answeredCount / depFile.questions.length * 100).toFixed(1);
    console.log(`\nOverall: ${answeredCount}/${depFile.questions.length} questions answered (${percentAnswered}%)`);
    console.log(`Pre-existing answers: ${depFile.preExistingAnswers}`);
    console.log(`Anchor answers: ${allAnchorAnswers.length}`);
    console.log(`Inferred answers: ${answeredCount - depFile.preExistingAnswers - allAnchorAnswers.length}`);
    
    console.log(`\nOutput file: ${outputFilePath}`);
    
    // Close readline interface
    rl.close();
    
  } catch (error) {
    console.error('Error running DEP autofill:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  rl.close();
  process.exit(1);
});
