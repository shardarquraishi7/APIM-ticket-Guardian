import * as fs from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';

const MONTH_SHEETS = ['Jan','Feb','March','April','May','June','July','August','Sept','Oct','Nov','Dec'];
const INPUT_PATH   = path.join(process.cwd(), 'kb_source', 'Copy of 2025 Ticket Count.xlsx');
const OUTPUT_PATH  = path.join(process.cwd(), 'kb_source', 'tickets.json');

interface TicketDoc {
  id: string;
  content: string;
  metadata: Record<string, any>;
  dates: { submitted?: string; resolved?: string };
  type: 'ticket';
}

function toISO(dateVal: any): string | undefined {
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function convert(): void {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`ERROR: File not found at ${INPUT_PATH}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(INPUT_PATH);
  const docs: TicketDoc[] = [];

  for (const sheet of MONTH_SHEETS) {
    const ws = wb.Sheets[sheet];
    if (!ws) continue;
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    rows.forEach(row => {
      const baseId = `${sheet}-${row['Incident ID']}`;
      const content = [ row['Incident Summary'], row['Incident Description'] ]
        .filter(Boolean).join('\n\n');
      const dates = {
        submitted: toISO(row['Submit Date']),
        resolved:  toISO(row['Last Resolved Date'])
      };
      const metadata = {
        sheet,
        priority: row['Priority'],
        status:   row['Status'],
        category: row['Category'],
        product:  row['Product Name']
      };
      docs.push({ id: baseId, content, metadata, dates, type: 'ticket' });
      if (row['Resolution Note']) {
        docs.push({
          id:       `${baseId}-res`,
          content:  row['Resolution Note'],
          metadata: { ...metadata, section: 'resolution' },
          dates,
          type:     'ticket'
        });
      }
    });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(docs, null, 2));
  console.log(`✅ Wrote ${docs.length} documents to ${OUTPUT_PATH}`);
}

// Run the conversion if this file is executed directly
if (require.main === module) {
  convert();
}
