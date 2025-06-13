#!/usr/bin/env ts-node

/**
 * Script to run fixed-point inference over all clusters in a DEP file
 * 
 * This script:
 * 1. Takes a DEP file path as input
 * 2. Takes user-provided answers for the anchor questions
 * 3. Runs the inference algorithm to predict answers for all questions
 * 4. Saves the updated file
 * 
 * Usage:
 * ts-node src/scripts/run-fixed-point-inference-all-clusters.ts <dep-file-path>
 * 
 * Example:
 * ts-node src/scripts/run-fixed-point-inference-all-clusters.ts ./sample-data/DEP.xlsx
 */

import path from 'path';
import fs from 'fs';
import { xlsxService } from '@/services/xlsx/xlsx-service';
import { questionService } from '@/services/xlsx/question-service';
import { createLogger } from '@/lib/logger';
import { ANCHORS } from '@/data/questions';

const logger = createLogger('run-fixed-point-inference-all-clusters');

/**
 * Main function to run the fixed-point inference over all clusters
 */
async function main() {
  try {
    // Get the DEP file path from command line arguments or use a default
    const filePath = process.argv[2] || path.join(process.cwd(), 'src', 'sample-data', 'DEP.xlsx');
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    
    logger.info(`Reading DEP file from ${filePath}`);
    
    // Read the DEP file
    const fileData = await xlsxService.readDEPFile(filePath);
    logger.info(`File read successfully. Found ${fileData.questions.length} questions.`);
    logger.info(`Pre-existing answers: ${fileData.preExistingAnswers}`);
    
    // Define the anchor answers (these would normally come from user input)
    // Format: [questionId, answer]
    const anchorAnswers: [string, string][] = [
      // Example anchor answers - replace with actual answers
      ['2.6 Is personal information in scope for this initiative? (Single selection allowed) *', 'Yes'],
      ['2.7 Is personal health information (PHI) in scope for this initiative? (Single selection allowed) *', 'No'],
      ['13.1 Identify any third parties involved in this initiative (Multiple selections allowed) (Justification allowed) (Allows other) *', 'Yes, one third party'],
      ['9.1 How is credit card data (including PAN, CVV, expiry date, etc.) processed in your initiative? (Single selection allowed) (Justification allowed) (Allows other) *', 'Not applicable / No credit card data involved'],
      ['7.1 Are you building or leveraging any AI agents (i.e. Agentic AI) in this implementation ? (Single selection allowed) *', 'Yes'],
      ['7.3 Does this initiative use Generative AI?  (Single selection allowed) *', 'Yes'],
      ['11.1 General Data Protection Regulation (GDPR)', 'None of these'],
      ['4.5 Does your initiative collect or infer personal information of minors (under the age of majority)? (Single selection allowed) *', 'No'],
      ['7.15 Are you using the TELUS Generative AI Toolkit? (Single selection allowed) *', 'Yes'],
      ['1.1 Description *', 'This is a test project for DEP automation']
    ];
    
    console.log('\n=== Running Fixed-Point Inference Over All Clusters ===\n');
    console.log('Using the following anchor answers:');
    anchorAnswers.forEach(([id, answer]) => {
      console.log(`${id}: ${answer}`);
    });
    console.log('');
    
    // Run the inference algorithm
    console.log('Running inference algorithm...');
    const startTime = Date.now();
    
    // Predict answers for all questions using anchor answers
    const predictionResult = await questionService.predictFromAnchors(
      fileData.questions,
      anchorAnswers
    );
    
    // Extract the predicted questions array
    const predictedQuestions = predictionResult.predictedQuestions;
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Count questions with answers
    const answeredCount = predictedQuestions.filter(q => q.answer && q.answer.trim() !== '').length;
    console.log(`Predicted answers for ${answeredCount} out of ${fileData.questions.length} questions`);
    console.log(`Inference completed in ${duration.toFixed(2)} seconds`);
    
    // Generate output file path
    const outputFilePath = filePath.replace('.xlsx', '_autofill_all_clusters.xlsx');
    
    // Create a copy of the original file first
    fs.copyFileSync(filePath, outputFilePath);
    logger.info(`Created copy of original file at ${outputFilePath}`);
    
    // Update the DEP file with the predicted answers
    const updatedFilePath = await xlsxService.updateDEPFile(outputFilePath, predictedQuestions);
    logger.info(`Updated file saved to ${updatedFilePath}`);
    
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
    const percentAnswered = (answeredCount / fileData.questions.length * 100).toFixed(1);
    console.log(`\nOverall: ${answeredCount}/${fileData.questions.length} questions answered (${percentAnswered}%)`);
    console.log(`Pre-existing answers: ${fileData.preExistingAnswers}`);
    console.log(`Anchor answers: ${anchorAnswers.length}`);
    console.log(`Inferred answers: ${answeredCount - fileData.preExistingAnswers - anchorAnswers.length}`);
    
    console.log(`\nOutput file: ${updatedFilePath}`);
    
    // Print confidence levels
    const highConfidence = predictedQuestions.filter(q => q.confidence && q.confidence >= 0.7).length;
    const mediumConfidence = predictedQuestions.filter(q => q.confidence && q.confidence >= 0.4 && q.confidence < 0.7).length;
    const lowConfidence = predictedQuestions.filter(q => q.confidence && q.confidence > 0 && q.confidence < 0.4).length;
    const noConfidence = predictedQuestions.filter(q => !q.confidence || q.confidence === 0).length;
    
    console.log('\nConfidence levels:');
    console.log(`- High confidence (>=0.7): ${highConfidence} questions`);
    console.log(`- Medium confidence (0.4-0.7): ${mediumConfidence} questions`);
    console.log(`- Low confidence (<0.4): ${lowConfidence} questions`);
    console.log(`- No confidence: ${noConfidence} questions`);
    
    // Check if any questions are still unanswered
    const unansweredQuestions = predictedQuestions.filter(q => !q.answer || q.answer.trim() === '');
    if (unansweredQuestions.length > 0) {
      console.log(`\nWARNING: ${unansweredQuestions.length} questions still have no answers.`);
      
      // Log the first 5 unanswered questions
      console.log(`\nSample of unanswered questions (${Math.min(5, unansweredQuestions.length)} of ${unansweredQuestions.length}):`);
      unansweredQuestions.slice(0, 5).forEach(q => {
        console.log(`- ${q.id}: ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`);
      });
    } else {
      console.log('\nSUCCESS: All questions have answers!');
    }
  } catch (error: any) {
    logger.error('Error processing DEP file:', error);
    console.error('Error processing DEP file:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
