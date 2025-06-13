import { XlsxService, xlsxService } from '@/services/xlsx/xlsx-service';
import { questionService } from '@/services/xlsx/question-service';
import path from 'path';
import fs from 'fs';

/**
 * Script to test DEP file processing functionality
 */
async function main() {
  try {
    // Path to the sample DEP file
    const sampleFilePath = path.join(process.cwd(), 'src', 'sample-data', 'DEP.xlsx');
    
    // Check if the file exists
    if (!fs.existsSync(sampleFilePath)) {
      console.error(`Sample file not found at ${sampleFilePath}`);
      return;
    }
    
    console.log(`Reading sample DEP file from ${sampleFilePath}`);
    
    // Read the DEP file
    const fileData = await xlsxService.readDEPFile(sampleFilePath);
    
    console.log(`File read successfully. Found ${fileData.questions.length} questions.`);
    console.log(`Pre-existing answers: ${fileData.preExistingAnswers}`);
    
    // Group questions by section
    const sectionCounts: Record<string, number> = {};
    fileData.questions.forEach(q => {
      const sectionId = q.id.split('.')[0];
      sectionCounts[sectionId] = (sectionCounts[sectionId] || 0) + 1;
    });
    
    console.log('Section breakdown:');
    Object.entries(sectionCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .forEach(([section, count]) => {
        console.log(`- Section ${section}: ${count} questions`);
      });
    
    // Create map of existing answers
    const existingAnswers = new Map<string, string>();
    fileData.questions.forEach(q => {
      if (q.answer && q.answer.trim() !== '') {
        existingAnswers.set(q.id, q.answer);
      }
    });
    
    // Select anchor questions
    const anchorQuestions = questionService.selectAnchorQuestions(
      fileData.questions,
      existingAnswers,
      8 // Maximum number of questions to ask
    );
    
    console.log(`Selected ${anchorQuestions.length} anchor questions:`);
    anchorQuestions.forEach(q => {
      console.log(`- ${q.id}: ${q.question}`);
    });
    
    // Simulate user answers to anchor questions
    const anchorAnswers = new Map<string, string>();
    anchorQuestions.forEach(q => {
      // Simulate a user answer (in a real scenario, these would come from user input)
      anchorAnswers.set(q.id, 'Sample answer for ' + q.id);
    });
    
    // Predict answers for remaining questions
    const predictionResult = await questionService.predictFromAnchors(
      fileData.questions,
      anchorAnswers
    );
    
    // Extract the predicted questions array
    const predictedQuestions = predictionResult.predictedQuestions;
    
    // Count predicted answers
    const predictedCount = predictedQuestions.filter(q => 
      q.answer && 
      q.answer.trim() !== '' && 
      !anchorAnswers.has(q.id)
    ).length;
    
    console.log(`Predicted answers for ${predictedCount} questions.`);
    
    // Count confidence levels
    const highConfidencePredictions = predictedQuestions.filter(q => q.confidence && q.confidence >= 0.7).length;
    const mediumConfidencePredictions = predictedQuestions.filter(q => q.confidence && q.confidence >= 0.4 && q.confidence < 0.7).length;
    const lowConfidencePredictions = predictedQuestions.filter(q => q.confidence && q.confidence < 0.4).length;
    
    console.log('Prediction confidence:');
    console.log(`- High confidence: ${highConfidencePredictions} predictions`);
    console.log(`- Medium confidence: ${mediumConfidencePredictions} predictions`);
    console.log(`- Low confidence: ${lowConfidencePredictions} predictions`);
    
    // Save the analysis to a JSON file for reference
    const analysisData = {
      totalQuestions: fileData.questions.length,
      preExistingAnswers: fileData.preExistingAnswers,
      sectionCounts,
      anchorQuestions: anchorQuestions.map(q => ({ id: q.id, questionText: q.question })),
      predictedCount,
      confidenceLevels: {
        high: highConfidencePredictions,
        medium: mediumConfidencePredictions,
        low: lowConfidencePredictions
      }
    };
    
    const analysisFilePath = path.join(process.cwd(), 'src', 'sample-data', 'dep-analysis.json');
    fs.writeFileSync(analysisFilePath, JSON.stringify(analysisData, null, 2));
    
    console.log(`Analysis saved to ${analysisFilePath}`);
    
    // Update the file with predicted answers
    const updatedFilePath = await xlsxService.updateDEPFile(
      sampleFilePath,
      predictedQuestions
    );
    
    console.log(`Updated file saved to ${updatedFilePath}`);
    
  } catch (error: any) {
    console.error('Error processing DEP file:', error);
  }
}

// Run the script
main();
