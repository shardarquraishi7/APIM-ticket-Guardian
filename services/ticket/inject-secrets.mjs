#! /usr/bin/env zx
$.verbose = false // remove verbose output
import dotenv from 'dotenv'
import fs from 'fs'

await $`shippy login --silent && shippy project sia-copilot`

// Load .env.local file
const envConfig = dotenv.config({ path: '.env.local' })

if (envConfig.error) {
  console.log('Error loading .env.local file')
  process.exit(1)
}

// Format value based on content
const formatValue = (value) => {
  // Handle multiline RSA key
  if (value.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    return `|-\n  ${value.replace(/\\n/g, '\n  ')}`
  }
  // Don't quote values that reference other variables
  if (value.startsWith('$')) {
    return value
  }
  return `"${value}"`
}

// Create YAML content
const yamlContent = Object.entries(envConfig.parsed)
  .map(([key, value]) => `${key}: ${formatValue(value)}`)
  .join('\n')

// Write to secrets.yaml file
try {
  fs.writeFileSync('secrets.yaml', yamlContent)
  console.log('Successfully created secrets.yaml')

  // Create secret using shippy
  await $`shippy delete secret sia`
  await $`shippy create secret sia -f secrets.yaml`
  console.log('Successfully created secret in shippy')
} catch (error) {
  console.error('Error writing secrets.yaml:', error)
  process.exit(1)
}
