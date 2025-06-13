import { createLogger } from '@/lib/logger';
import { xlsxService } from '@/services/xlsx/xlsx-service';
import { questionService } from '@/services/xlsx/question-service';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { ANCHORS, anchorQuestionPrompts } from '@/data/questions';
import { anchorQuestions as depAnchorQuestions } from '@/ai/prompts/questions';

const logger = createLogger('run-fixed-point-inference');

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt the user for an answer to a question
 * @param question - The question to ask
 * @param options - The available options
 * @returns The user's answer
 */
function promptUser(question: string, options?: string[]): Promise<string> {
  return new Promise((resolve) => {
    console.log(`\n${question}`);
    
    if (options && options.length > 0) {
      console.log('\nOptions:');
      options.forEach((option, index) => {
        console.log(`${index + 1}. ${option}`);
      });
      console.log('\nEnter the number or the full text of your answer:');
    }
    
    rl.question('> ', (answer) => {
      // If the user entered a number, convert it to the corresponding option
      if (options && /^\d+$/.test(answer.trim())) {
        const index = parseInt(answer.trim(), 10) - 1;
        if (index >= 0 && index < options.length) {
          resolve(options[index]);
          return;
        }
      }
      
      // Otherwise, use the answer as-is
      resolve(answer.trim());
    });
  });
}

/**
 * Main function to run the fixed-point inference with user-provided answers
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
    
    // Define an array to store the anchor answers
    const anchorAnswers: [string, string][] = [];
    
    console.log('\n=== DEP Fixed-Point Inference ===\n');
    console.log(`This script will guide you through answering the 7 anchor questions for the DEP file.`);
    console.log(`Your answers will be used to predict answers for all ${fileData.questions.length} questions in the file.`);
    console.log(`\nPress Ctrl+C at any time to exit.\n`);
    
    // Ask the user for answers to each anchor question
    for (const anchorId of ANCHORS) {
      // Find the anchor question prompt
      const anchorPrompt = anchorQuestionPrompts.find(q => q.id === anchorId);
      if (!anchorPrompt) {
        logger.warn(`No prompt found for anchor ${anchorId}, skipping`);
        continue;
      }
      
      // Find the matching question in the Excel file
      const matchingQuestion = fileData.questions.find(q => {
        // For numeric question IDs (e.g., "2.6")
        if (anchorId.match(/^\d+\.\d+$/)) {
          // Extract just the question number (e.g., "2.6" from "2.6 Is personal information in scope?")
          const questionIdMatch = q.id.match(/^(\d+\.\d+)/);
          const questionId = questionIdMatch ? questionIdMatch[1] : q.id;
          return questionId === anchorId;
        }
        // For special case SECTION_REGIMES
        else if (anchorId === "SECTION_REGIMES") {
          // Look for questions related to regulatory regimes
          return q.id.includes("SECTION_REGIMES") || 
                (q.id.match(/^10\./) && q.question.toLowerCase().includes("quebec")) ||
                (q.id.match(/^11\./) && q.question.toLowerCase().includes("gdpr")) ||
                (q.id.match(/^12\./) && q.question.toLowerCase().includes("hipaa"));
        }
        return false;
      });
      
      if (!matchingQuestion) {
        logger.warn(`Could not find matching question for anchor ${anchorId} in the Excel file, skipping`);
        continue;
      }
      
      // Display the question with context
      console.log(`\n=== Anchor Question ${anchorPrompt.id} ===`);
      
      // Find the matching question in our predefined list to get the explanation
      const questionObj = depAnchorQuestions.find(q => q.id === anchorPrompt.id);
      
      // Use the explanation from our predefined list if available, otherwise use from the prompt
      const explanation = questionObj?.explanation || anchorPrompt.context;
      
      console.log(`Context: ${explanation}`);
      
      // Get the user's answer
      const answer = await promptUser(matchingQuestion.question, anchorPrompt.options);
      
      // If the answer is empty, try again
      if (!answer || answer.trim() === '') {
        console.log('No answer provided. Please try again.');
        const retryAnswer = await promptUser(matchingQuestion.question, anchorPrompt.options);
        if (!retryAnswer || retryAnswer.trim() === '') {
          console.log('Still no answer provided. Using default "Yes" for this question.');
          anchorAnswers.push([matchingQuestion.id, 'Yes']);
          console.log(`Answer recorded: Yes (default)`);
        } else {
          anchorAnswers.push([matchingQuestion.id, retryAnswer]);
          console.log(`Answer recorded: ${retryAnswer}`);
        }
      } else {
        // Add the answer to the array
        anchorAnswers.push([matchingQuestion.id, answer]);
        console.log(`Answer recorded: ${answer}`);
      }
    }
    
    console.log('\n=== Running Fixed-Point Inference ===\n');
    console.log('Using the following anchor answers:');
    anchorAnswers.forEach(([id, answer]) => {
      console.log(`${id}: ${answer}`);
    });
    console.log('');
    
    // Predict answers for all questions using anchor answers
    const predictionResult = await questionService.predictFromAnchors(
      fileData.questions,
      anchorAnswers
    );
    
    // Extract the predicted questions array
    const predictedQuestions = predictionResult.predictedQuestions;
    
    // Count questions with answers
    const answeredCount = predictedQuestions.filter(q => q.answer && q.answer.trim() !== '').length;
    logger.info(`Predicted answers for ${answeredCount} out of ${fileData.questions.length} questions`);
    
    // Generate output file path
    const outputFilePath = filePath.replace('.xlsx', '_autofill.xlsx');
    
    // Create a copy of the original file first
    fs.copyFileSync(filePath, outputFilePath);
    logger.info(`Created copy of original file at ${outputFilePath}`);
    
    // Update the DEP file with the predicted answers
    const updatedFilePath = await xlsxService.updateDEPFile(outputFilePath, predictedQuestions);
    logger.info(`Updated file saved to ${updatedFilePath}`);
    
    // Log success message
    if (answeredCount === fileData.questions.length) {
      console.log('\nSUCCESS: All questions have answers!');
    } else {
      console.log(`\nWARNING: ${fileData.questions.length - answeredCount} questions still have no answers.`);
      
      // Log questions without answers
      const unansweredQuestions = predictedQuestions.filter(q => !q.answer || q.answer.trim() === '');
      console.log(`\nUnanswered questions (${unansweredQuestions.length}):`);
      unansweredQuestions.forEach(q => {
        console.log(`- ${q.id}: ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`);
      });
    }
    
    // Log confidence levels
    const highConfidence = predictedQuestions.filter(q => q.confidence && q.confidence >= 0.7).length;
    const mediumConfidence = predictedQuestions.filter(q => q.confidence && q.confidence >= 0.4 && q.confidence < 0.7).length;
    const lowConfidence = predictedQuestions.filter(q => q.confidence && q.confidence > 0 && q.confidence < 0.4).length;
    const noConfidence = predictedQuestions.filter(q => !q.confidence || q.confidence === 0).length;
    
    console.log('\nConfidence levels:');
    console.log(`- High confidence (>=0.7): ${highConfidence} questions`);
    console.log(`- Medium confidence (0.4-0.7): ${mediumConfidence} questions`);
    console.log(`- Low confidence (<0.4): ${lowConfidence} questions`);
    console.log(`- No confidence: ${noConfidence} questions`);
    
    // Log section coverage
    const sectionCounts = fileData.sectionCounts || {};
    const sectionCoverage: Record<string, { total: number, answered: number }> = {};
    
    // Initialize section coverage
    Object.entries(sectionCounts).forEach(([section, count]) => {
      sectionCoverage[section] = { total: count, answered: 0 };
    });
    
    // Count answered questions by section
    predictedQuestions.forEach(q => {
      if (q.answer && q.answer.trim() !== '') {
        // Extract section from question ID (e.g., "2.6" -> "2")
        const sectionMatch = q.id.match(/^(\d+)\./);
        const section = sectionMatch ? sectionMatch[1] : 'unknown';
        
        if (sectionCoverage[section]) {
          sectionCoverage[section].answered++;
        } else {
          sectionCoverage[section] = { total: 1, answered: 1 };
        }
      }
    });
    
    console.log('\nSection coverage:');
    Object.entries(sectionCoverage)
      .sort((a, b) => a[0].localeCompare(b[0])) // Sort by section number
      .forEach(([section, { total, answered }]) => {
        const percentage = Math.round((answered / total) * 100);
        console.log(`- Section ${section}: ${answered}/${total} (${percentage}%)`);
      });
    
    // Close the readline interface
    rl.close();
  } catch (error: any) {
    logger.error('Error processing DEP file:', error);
    console.error('Error processing DEP file:', error.message);
    
    // Close the readline interface
    rl.close();
    process.exit(1);
  }
}

// Run the main function
main();
