#!/usr/bin/env node

/**
 * This script sets up the AI integration for the chatbot.
 * It installs the OpenAI SDK and updates the necessary files.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🤖 Setting up AI integration for the TELUS chatbot...\n');

// Install OpenAI SDK
console.log('📦 Installing OpenAI SDK...');
try {
  execSync('npm install openai', { stdio: 'inherit' });
  console.log('✅ OpenAI SDK installed successfully.\n');
} catch (error) {
  console.error('❌ Failed to install OpenAI SDK:', error.message);
  process.exit(1);
}

// Check if .env or .env.local files exist and check for OpenAI API key
const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');
let envContent = '';
let envLocalContent = '';
let apiKeyExists = false;

// Check .env.local first (we won't modify this file)
if (fs.existsSync(envLocalPath)) {
  envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envLocalContent.includes('OPENAI_API_KEY')) {
    console.log('ℹ️ OpenAI API key already exists in .env.local file.\n');
    apiKeyExists = true;
    
    // Check if base URL is also defined
    if (envLocalContent.includes('OPENAI_BASE_URL')) {
      console.log('ℹ️ OpenAI base URL also detected in .env.local file.\n');
    }
  }
}

// Check .env file
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('OPENAI_API_KEY')) {
    console.log('ℹ️ OpenAI API key already exists in .env file.\n');
    apiKeyExists = true;
  }
}

// Only add to .env if API key doesn't exist in either file
if (!apiKeyExists) {
  console.log('📝 Adding OpenAI API key placeholder to .env file...');
  
  // Create .env file if it doesn't exist
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, '# Environment Variables\n');
  }
  
  const apiKeyLine = '\n# OpenAI API key for chatbot\nOPENAI_API_KEY=your_api_key_here\n';
  fs.appendFileSync(envPath, apiKeyLine);
  
  console.log('✅ Added OpenAI API key placeholder to .env file.\n');
  console.log('ℹ️ Note: We detected an existing .env.local file which we did not modify.\n');
}

// Check if knowledge base path is defined
let kbPathExists = false;
if (envLocalContent.includes('KNOWLEDGE_BASE_PATH')) {
  console.log('ℹ️ Knowledge base path already exists in .env.local file.\n');
  kbPathExists = true;
} else if (envContent.includes('KNOWLEDGE_BASE_PATH')) {
  console.log('ℹ️ Knowledge base path already exists in .env file.\n');
  kbPathExists = true;
}

// Add knowledge base path if it doesn't exist
if (!kbPathExists) {
  console.log('📝 Adding knowledge base path placeholder to .env file...');
  
  const kbPathLine = '\n# Path to knowledge base JSON file\nKNOWLEDGE_BASE_PATH=C:/path/to/your/knowledge-base.json\n';
  fs.appendFileSync(envPath, kbPathLine);
  
  console.log('✅ Added knowledge base path placeholder to .env file.\n');
}

// Ask if the user wants to replace the current route with the enhanced version
rl.question('❓ Do you want to replace the current chatbot API route with the enhanced AI version? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    try {
      const routePath = path.join(process.cwd(), 'src', 'app', 'api', 'chatbot', 'route.ts');
      const enhancedRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'chatbot', 'enhanced-route.ts');
      
      // Backup the current route
      const backupPath = path.join(process.cwd(), 'src', 'app', 'api', 'chatbot', 'route.backup.ts');
      fs.copyFileSync(routePath, backupPath);
      
      // Replace with enhanced route
      fs.copyFileSync(enhancedRoutePath, routePath);
      
      console.log('✅ Replaced chatbot API route with enhanced AI version.');
      console.log('ℹ️ Original route backed up to route.backup.ts\n');
    } catch (error) {
      console.error('❌ Failed to replace API route:', error.message);
    }
  } else {
    console.log('ℹ️ Skipped replacing the API route.\n');
  }
  
  // Add database schema
  rl.question('❓ Do you want to add the chatbot tables to your database schema? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      try {
        const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
        
        if (fs.existsSync(schemaPath)) {
          const schemaContent = fs.readFileSync(schemaPath, 'utf8');
          
          if (!schemaContent.includes('chatbot_conversations')) {
            const chatbotSchema = `
-- Chatbot tables
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chatbot_conversations (id) ON DELETE CASCADE
);
`;
            fs.appendFileSync(schemaPath, chatbotSchema);
            console.log('✅ Added chatbot tables to database schema.\n');
          } else {
            console.log('ℹ️ Chatbot tables already exist in database schema.\n');
          }
        } else {
          console.log('❌ Database schema file not found. Please create it manually.\n');
        }
      } catch (error) {
        console.error('❌ Failed to update database schema:', error.message);
      }
    } else {
      console.log('ℹ️ Skipped adding chatbot tables to database schema.\n');
    }
    
    console.log('🎉 AI integration setup complete!');
    console.log('\nNext steps:');
    
    if (envLocalContent.includes('OPENAI_API_KEY')) {
      console.log('1. Your OpenAI API key was detected in .env.local - no need to add it again');
    } else if (envContent.includes('OPENAI_API_KEY')) {
      console.log('1. Your OpenAI API key was detected in .env - no need to add it again');
    } else {
      console.log('1. Add your OpenAI API key to the .env file');
    }
    
    // Knowledge base path message
    if (envLocalContent.includes('KNOWLEDGE_BASE_PATH')) {
      console.log('2. Your knowledge base path was detected in .env.local - no need to add it again');
    } else if (envContent.includes('KNOWLEDGE_BASE_PATH')) {
      console.log('2. Update the knowledge base path in .env to point to your JSON file');
    } else {
      console.log('2. Add the path to your knowledge base JSON file in the .env file');
    }
    
    console.log('3. Restart your development server');
    console.log('4. Test the chatbot with AI responses');
    console.log('\nFor more information, see docs/ENHANCING_CHATBOT.md');
    
    rl.close();
  });
});
