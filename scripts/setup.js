#!/usr/bin/env node

/**
 * Setup script for the Next.js Cloudflare Workers Starter Kit
 * This script helps users set up their environment for development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Helper function to print colored text
function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

// Helper function to print a section header
function printHeader(text) {
  console.log('\n' + colorize('='.repeat(80), colors.fg.magenta));
  console.log(colorize(` ${text} `, colors.bright + colors.fg.magenta));
  console.log(colorize('='.repeat(80), colors.fg.magenta) + '\n');
}

// Helper function to print a success message
function printSuccess(text) {
  console.log(colorize(`✓ ${text}`, colors.fg.green));
}

// Helper function to print an error message
function printError(text) {
  console.log(colorize(`✗ ${text}`, colors.fg.red));
}

// Helper function to print an info message
function printInfo(text) {
  console.log(colorize(`ℹ ${text}`, colors.fg.cyan));
}

// Helper function to execute a command and return its output
function execCommand(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return null;
  }
}

// Helper function to check if a command exists
function commandExists(command) {
  const whichCommand = process.platform === 'win32' ? 'where' : 'which';
  try {
    execSync(`${whichCommand} ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to create a file if it doesn't exist
function createFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    printSuccess(`Created ${filePath}`);
    return true;
  }
  printInfo(`${filePath} already exists, skipping`);
  return false;
}

// Helper function to ask a question and get a response
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Main setup function
async function setup() {
  printHeader('Next.js Cloudflare Workers Starter Kit Setup');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const nodeVersionNumber = Number(nodeVersion.slice(1).split('.')[0]);
  
  if (nodeVersionNumber < 18) {
    printError(`Node.js version ${nodeVersion} is not supported. Please upgrade to Node.js 18 or later.`);
    process.exit(1);
  }
  
  printSuccess(`Node.js ${nodeVersion} detected`);
  
  // Check npm version
  const npmVersion = execCommand('npm --version');
  const npmVersionNumber = Number(npmVersion.split('.')[0]);
  
  if (npmVersionNumber < 8) {
    printError(`npm version ${npmVersion} is not supported. Please upgrade to npm 8 or later.`);
    process.exit(1);
  }
  
  printSuccess(`npm ${npmVersion} detected`);
  
  // Check if Wrangler is installed
  const wranglerInstalled = commandExists('wrangler');
  
  if (!wranglerInstalled) {
    printInfo('Wrangler CLI not found. Installing...');
    try {
      execSync('npm install -g wrangler', { stdio: 'inherit' });
      printSuccess('Wrangler CLI installed successfully');
    } catch (error) {
      printError('Failed to install Wrangler CLI. Please install it manually: npm install -g wrangler');
    }
  } else {
    const wranglerVersion = execCommand('wrangler --version');
    printSuccess(`Wrangler ${wranglerVersion} detected`);
  }
  
  // Create .env file if it doesn't exist
  const envContent = `# Environment Variables
ENVIRONMENT=development
`;
  
  createFileIfNotExists('.env', envContent);
  
  // Create .env.local file if it doesn't exist
  const envLocalContent = `# Local Environment Variables
# Add your local environment variables here
`;
  
  createFileIfNotExists('.env.local', envLocalContent);
  
  // Ask if the user wants to set up Cloudflare D1
  const setupD1 = await askQuestion(colorize('Do you want to set up Cloudflare D1 database? (y/n): ', colors.bright));
  
  if (setupD1.toLowerCase() === 'y') {
    printHeader('Setting up Cloudflare D1');
    
    printInfo('You need to be logged in to Cloudflare to create a D1 database.');
    printInfo('If you are not logged in, you will be prompted to log in.');
    
    const proceed = await askQuestion(colorize('Proceed with Cloudflare login? (y/n): ', colors.bright));
    
    if (proceed.toLowerCase() === 'y') {
      try {
        execSync('wrangler login', { stdio: 'inherit' });
        printSuccess('Logged in to Cloudflare');
        
        printInfo('Creating D1 database...');
        execSync('wrangler d1 create starter-kit-db', { stdio: 'inherit' });
        
        printInfo('Please update your wrangler.toml file with the database ID from the output above.');
        printInfo('Then run: wrangler d1 execute starter-kit-db --file=./database/schema.sql');
      } catch (error) {
        printError('Failed to set up Cloudflare D1. Please try again later or set it up manually.');
      }
    }
  }
  
  // Final instructions
  printHeader('Setup Complete');
  
  printInfo('To start the development server, run:');
  console.log(colorize('  npm run dev', colors.bright));
  
  printInfo('To deploy to Cloudflare Workers, run:');
  console.log(colorize('  npm run deploy', colors.bright));
  
  printInfo('For more information, check the README.md file.');
  
  rl.close();
}

// Run the setup function
setup().catch(error => {
  printError(`An error occurred: ${error.message}`);
  process.exit(1);
});