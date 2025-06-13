// Script to examine the DEP.xlsx file structure
const ExcelJS = require('exceljs');
const path = require('path');

async function examineExcelFile() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'sample-data', 'DEP.xlsx');
    console.log('Examining file:', filePath);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // List all worksheets
    console.log('\nWorksheets in the file:');
    workbook.eachSheet((worksheet, sheetId) => {
      console.log(`Sheet ${sheetId}: ${worksheet.name}`);
    });
    
    // Examine Sheet 2 (index 1)
    const sheet2 = workbook.getWorksheet(2);
    if (sheet2) {
      console.log(`\nExamining Sheet 2: ${sheet2.name}`);
      
      // Find the row with headers (row 8 according to user)
      console.log('\nRow 8 (headers):');
      const headerRow = sheet2.getRow(8);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        const colLetter = String.fromCharCode(64 + colNumber);
        console.log(`Column ${colLetter} (${colNumber}): ${cell.text}`);
        headers[colNumber] = cell.text;
      });
      
      // Look at a few sample data rows
      console.log('\nSample data rows:');
      for (let rowNum = 9; rowNum <= 11; rowNum++) {
        const row = sheet2.getRow(rowNum);
        console.log(`\nRow ${rowNum}:`);
        row.eachCell((cell, colNumber) => {
          const colLetter = String.fromCharCode(64 + colNumber);
          const header = headers[colNumber] || 'Unknown';
          console.log(`  ${colLetter} (${header}): ${cell.text}`);
        });
      }
      
      // Count total rows with data
      let totalRows = 0;
      sheet2.eachRow((row, rowNumber) => {
        if (rowNumber > 8) { // Skip header rows
          // Check if row has data in column A
          const cellA = row.getCell(1);
          if (cellA.text && cellA.text.trim() !== '') {
            totalRows++;
          }
        }
      });
      console.log(`\nTotal data rows: ${totalRows}`);
    } else {
      console.log('Sheet 2 not found');
    }
    
  } catch (error) {
    console.error('Error examining Excel file:', error);
  }
}

examineExcelFile();
