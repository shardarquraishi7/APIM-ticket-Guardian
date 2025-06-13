import { vectorizeTickets } from '@/utils/ticket-vectorizer';
import { convert } from '@/utils/xlsx-to-json';

async function main() {
  try {
    console.log('Starting API Ticket Knowledge Base sync...');
    
    // 1️⃣ Convert XLSX → tickets.json
    console.log('Step 1: Converting Excel to JSON...');
    await convert();
    
    // 2️⃣ Vectorize & upsert tickets
    console.log('Step 2: Vectorizing and storing ticket data...');
    await vectorizeTickets();
    
    console.log('✅ API Ticket Knowledge Base sync completed successfully!');
  } catch (error) {
    console.error('❌ Error during API Ticket Knowledge Base sync:', error);
    throw error;
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
