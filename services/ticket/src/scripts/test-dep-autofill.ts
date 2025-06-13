import { createLogger } from '@/lib/logger';
import { xlsxService } from '@/services/xlsx/xlsx-service';
import { questionService } from '@/services/xlsx/question-service';
import path from 'path';
import fs from 'fs';

const logger = createLogger('test-dep-autofill');

/**
 * Main function to test the fixed-point inference with predefined answers
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
    
    // Define predefined answers for anchor questions
    // These are the 7 anchor questions that drive the inference
    const anchorAnswers: [string, string][] = [
      // Format: [questionId, answer]
      // Note: The questionId should match exactly with the ID in the Excel file
      
      // 2.6: Is personal information in scope?
      ["2.6", "Yes"],
      
      // 2.7: Is PHI in scope?
      ["2.7", "No"],
      
      // 13.1: Third-party vendors
      ["13.1", "Yes, one third party"],
      
      // 9.1: Credit-card/payment data
      ["9.1", "Not applicable / No credit card data involved"],
      
      // 7.1: AI/ML usage
      ["7.1", "Yes"],
      
      // 7.3: Generative AI usage
      ["7.3", "Yes"],
      
      // SECTION_REGIMES: Regulatory regimes
      // This might need to be adjusted based on the actual ID in the Excel file
      ["10.2", "Yes"] // Quebec privacy law
    ];
    
    console.log('\n=== Running Fixed-Point Inference with Predefined Answers ===\n');
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
    const outputFilePath = filePath.replace('.xlsx', '_test_autofill.xlsx');
    
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
  } catch (error: any) {
    logger.error('Error processing DEP file:', error);
    console.error('Error processing DEP file:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
