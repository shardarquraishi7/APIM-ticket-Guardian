import { createLogger } from '@/lib/logger';
import { anchorQuestions } from '@/ai/prompts/depQuestionsData';
import fs from 'fs';
import path from 'path';

const logger = createLogger('test-dep-ui');

/**
 * This script generates sample nextPrompt values to test the UI rendering
 * of DEP questions with context.
 */
async function main() {
  try {
    // Create a directory for the test output if it doesn't exist
    const outputDir = path.join(process.cwd(), 'src', 'sample-data', 'ui-tests');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate sample nextPrompt values for each anchor question
    const samples = anchorQuestions.map(question => {
      // Extract just the question number for display
      const questionIdMatch = question.id.match(/^(\d+\.\d+)/);
      const questionNumber = questionIdMatch ? questionIdMatch[1] : question.id;
      
      // Get the cluster information
      const clusterMatch = questionNumber.match(/^(\d+)\./);
      const clusterNumber = clusterMatch ? clusterMatch[1] : '';
      
      // Create a detailed prompt with all the information
      let nextPrompt = `Question ${questionNumber}: ${question.questionText}\n\n`;
      
      // Add options if available
      if (question.options && question.options.length > 0) {
        nextPrompt += 'Options:\n';
        question.options.forEach((option, index) => {
          nextPrompt += `${index + 1}. ${option}\n`;
        });
      }
      
      // Add cluster information if available
      if (clusterNumber) {
        nextPrompt += `\nThis question is part of Cluster ${clusterNumber}.`;
      }
      
      // Add explanation if available
      if (question.explanation) {
        nextPrompt += `\n\nExplanation: ${question.explanation}`;
      }
      
      return {
        id: question.id,
        nextPrompt
      };
    });
    
    // Write the samples to a file
    const outputFile = path.join(outputDir, 'sample-prompts.json');
    fs.writeFileSync(outputFile, JSON.stringify(samples, null, 2));
    
    logger.info(`Generated ${samples.length} sample prompts and saved to ${outputFile}`);
    
    // Print the first sample for quick reference
    console.log('\nSample nextPrompt for UI testing:');
    console.log(samples[0].nextPrompt);
    
    // Create a simple HTML file to test the UI
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DEP Question UI Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .question-card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #4B286D;
    }
    h2 {
      color: #4B286D;
      font-size: 1.2rem;
      margin-top: 0;
    }
    .context {
      background-color: #F2EFF4;
      border-left: 4px solid #4B286D;
      padding: 10px;
      margin: 10px 0;
      font-size: 0.9rem;
    }
    .cluster {
      background-color: #F9F8FC;
      padding: 8px;
      border-radius: 4px;
      font-size: 0.9rem;
      margin: 10px 0;
    }
    .options {
      margin-top: 15px;
    }
    .options h3 {
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    .options ul {
      padding-left: 20px;
    }
    .options li {
      margin-bottom: 5px;
      font-size: 0.9rem;
    }
    .nav-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    button {
      background-color: #4B286D;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    #current-index {
      text-align: center;
      margin-top: 10px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>DEP Question UI Test</h1>
  <div id="question-container"></div>
  <div class="nav-buttons">
    <button id="prev-btn" disabled>Previous</button>
    <button id="next-btn">Next</button>
  </div>
  <div id="current-index">Question 1 of ${samples.length}</div>

  <script>
    // Load the sample prompts
    const samples = ${JSON.stringify(samples)};
    let currentIndex = 0;

    // Function to render a question
    function renderQuestion(index) {
      const sample = samples[index];
      const container = document.getElementById('question-container');
      const prompt = sample.nextPrompt;
      
      // Parse the prompt
      const questionPart = prompt.split(/Explanation:|Context:/)[0].trim();
      const hasExplanation = prompt.includes('Explanation:');
      const hasContext = prompt.includes('Context:');
      const explanationPart = hasExplanation 
        ? prompt.split('Explanation:')[1].split(/This question is part of|Options:/)[0].trim()
        : '';
      const contextPart = hasContext
        ? prompt.split('Context:')[1].split(/This question is part of|Options:/)[0].trim()
        : '';
      const hasCluster = prompt.includes('This question is part of');
      const clusterPart = hasCluster
        ? prompt.split('This question is part of')[1].split('Options:')[0].trim()
        : '';
      const hasOptions = prompt.includes('Options:');
      const optionsPart = hasOptions
        ? prompt.split('Options:')[1].split(/Explanation:|This question is part of/)[0].trim()
        : '';
      
      // Create the HTML
      let html = \`
        <div class="question-card">
          <h2>Question</h2>
          <div class="question-text">
            <p>\${questionPart}</p>
          </div>
      \`;
      
      if (hasExplanation || hasContext) {
        html += \`
          <div class="context">
            <h3>\${hasExplanation ? 'Explanation' : 'Context'}:</h3>
            <p>\${hasExplanation ? explanationPart : contextPart}</p>
          </div>
        \`;
      }
      
      if (hasCluster) {
        html += \`
          <div class="cluster">
            <p>This question is part of \${clusterPart}</p>
          </div>
        \`;
      }
      
      if (hasOptions) {
        html += \`
          <div class="options">
            <h3>Options:</h3>
            <ul>
        \`;
        
        const options = optionsPart.split('\\n').filter(line => line.trim());
        options.forEach(option => {
          const cleanOption = option.replace(/^\d+\.\s*/, '');
          html += \`<li>\${cleanOption}</li>\`;
        });
        
        html += \`
            </ul>
          </div>
        \`;
      }
      
      html += \`</div>\`;
      container.innerHTML = html;
      
      // Update the current index display
      document.getElementById('current-index').textContent = \`Question \${index + 1} of \${samples.length}\`;
      
      // Update button states
      document.getElementById('prev-btn').disabled = index === 0;
      document.getElementById('next-btn').disabled = index === samples.length - 1;
    }
    
    // Initial render
    renderQuestion(currentIndex);
    
    // Event listeners for navigation buttons
    document.getElementById('prev-btn').addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion(currentIndex);
      }
    });
    
    document.getElementById('next-btn').addEventListener('click', () => {
      if (currentIndex < samples.length - 1) {
        currentIndex++;
        renderQuestion(currentIndex);
      }
    });
  </script>
</body>
</html>
    `;
    
    const htmlFile = path.join(outputDir, 'test-ui.html');
    fs.writeFileSync(htmlFile, htmlContent);
    
    logger.info(`Created HTML test file at ${htmlFile}`);
    console.log(`\nOpen this file in your browser to test the UI: ${htmlFile}`);
    
  } catch (error: any) {
    logger.error('Error generating test data:', error);
    console.error('Error generating test data:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
