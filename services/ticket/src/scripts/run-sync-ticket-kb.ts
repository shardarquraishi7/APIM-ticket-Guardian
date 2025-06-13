import * as dotenv from 'dotenv';
import * as path from 'path';
import { vectorizeTickets } from '@/utils/ticket-vectorizer';
import { convert } from '@/utils/xlsx-to-json';
import { openai } from '@/lib/openai';

// Load environment variables from .env.development
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

// Override OpenAI configuration
process.env.OPENAI_API_KEY = 'J8ijWVfqriY1IsfUhG2Z3hOpFeFqopWfxd7phVvIcD4kizvpkyEUm0gwNJFfnzJLFOaAOSCbSs1m9Wbjc4bbdNM3jiSp6NWduJyE5daBHPLL8N6Bk_vXN5oRXJ81zJ5TiXToQ7Qdr_mQomLPTGtZ8VGx9O1IbYwYxm71qQEPng';
process.env.OPENAI_BASE_URL = 'https://fuelix.telus.com/api/v1';

// Manually configure OpenAI client
openai.apiKey = process.env.OPENAI_API_KEY;
openai.baseURL = process.env.OPENAI_BASE_URL;

async function main() {
  console.log('Using OpenAI API Key:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
  console.log('Using OpenAI Base URL:', process.env.OPENAI_BASE_URL);
  
  // 1️⃣ Convert XLSX → tickets.json
  await convert();
  // 2️⃣ Vectorize & upsert tickets
  await vectorizeTickets();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
