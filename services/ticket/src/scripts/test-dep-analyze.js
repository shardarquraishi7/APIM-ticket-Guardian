// Script to test the DEP analyze API
const fs = require('fs');
const path = require('path');

async function testDEPAnalyze() {
  try {
    const sampleFilePath = path.join(process.cwd(), 'src', 'sample-data', 'DEP.xlsx');
    
    console.log('Testing DEP analyze API with sample file:', sampleFilePath);
    
    const response = await fetch('http://localhost:3008/api/dep/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: sampleFilePath,
        fileName: 'DEP.xlsx',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    // Log specific information about the analysis
    console.log('\nFile Summary:');
    console.log(`- Total Questions: ${data.fileData.questionCount}`);
    console.log(`- Pre-existing Answers: ${data.fileData.preExistingAnswers}`);
    console.log(`- Completion: ${Math.round((data.fileData.preExistingAnswers / data.fileData.questionCount) * 100)}%`);
    
    if (data.state.anchorQuestions && data.state.anchorQuestions.length > 0) {
      console.log(`\nSelected ${data.state.anchorQuestions.length} anchor questions`);
    } else {
      console.log('\nNo anchor questions selected (file may be complete)');
    }
    
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Error testing DEP analyze API:', error);
  }
}

testDEPAnalyze();
