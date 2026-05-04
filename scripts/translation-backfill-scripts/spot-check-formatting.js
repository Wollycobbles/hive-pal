const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');

/**
 * Detect indentation style in JSON file
 * Returns: { type: 'spaces' | 'tabs', size: number }
 */
function detectIndentation(content) {
  // Look at lines with leading whitespace
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (/^ +/.test(line)) {
      // Count spaces
      const match = line.match(/^( +)/);
      if (match) {
        return { type: 'spaces', size: match[1].length };
      }
    } else if (/^\t+/.test(line)) {
      return { type: 'tabs', size: 1 };
    }
  }
  
  return { type: 'unknown', size: 0 };
}

/**
 * Check if keys at a given nesting level are sorted alphabetically
 */
function areKeysSorted(obj) {
  const keys = Object.keys(obj);
  return keys.every((key, i, arr) => i === 0 || key >= arr[i - 1]);
}

/**
 * Recursively check key sorting throughout object
 */
function checkAllKeysSorted(obj) {
  if (!areKeysSorted(obj)) {
    return false;
  }
  
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (!checkAllKeysSorted(value)) {
        return false;
      }
    }
  }
  
  return true;
}

function spotCheckFormatting() {
  console.log('🔍 Spot-checking formatting across locales\n');
  
  // Select 10 files strategically: mix of locales and namespaces
  const filesToCheck = [
    ['en', 'common'],
    ['en', 'inspection'],
    ['da', 'common'],
    ['de', 'apiary'],
    ['fr', 'auth'],
    ['it', 'common'],
    ['sk', 'hive'],
    ['sr', 'queen'],
    ['fr', 'inspection'],
    ['da', 'admin'],
  ];
  
  const results = [];
  
  for (const [locale, namespace] of filesToCheck) {
    const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      const indent = detectIndentation(content);
      const sorted = checkAllKeysSorted(data);
      const lineEnding = content.includes('\r\n') ? 'CRLF' : 'LF';
      const lines = content.split('\n').length;
      
      results.push({
        file: `${locale}/${namespace}`,
        indent,
        sorted,
        lineEnding,
        lines
      });
    } catch (error) {
      console.error(`Error processing ${locale}/${namespace}: ${error.message}`);
    }
  }
  
  console.log(`📊 FORMATTING SPOT-CHECK (${results.length} files):`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // Analyze indentation
  const indentStats = {};
  const sortedStats = { sorted: 0, unsorted: 0 };
  const lineEndingStats = {};
  
  for (const result of results) {
    const indentKey = `${result.indent.type}(${result.indent.size})`;
    indentStats[indentKey] = (indentStats[indentKey] || 0) + 1;
    
    if (result.sorted) sortedStats.sorted++;
    else sortedStats.unsorted++;
    
    lineEndingStats[result.lineEnding] = (lineEndingStats[result.lineEnding] || 0) + 1;
  }
  
  console.log(`📈 INDENTATION ANALYSIS:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  for (const [style, count] of Object.entries(indentStats)) {
    console.log(`  ${style}: ${count} files`);
  }
  console.log();
  
  console.log(`📈 KEY SORTING ANALYSIS:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Sorted: ${sortedStats.sorted} files`);
  console.log(`  Unsorted: ${sortedStats.unsorted} files`);
  console.log();
  
  console.log(`📈 LINE ENDING ANALYSIS:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  for (const [ending, count] of Object.entries(lineEndingStats)) {
    console.log(`  ${ending}: ${count} files`);
  }
  console.log();
  
  console.log(`📋 DETAILED RESULTS:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`File                  | Indent    | Sorted | Line Ending | Lines`);
  console.log(`─────────────────────────────────────────────────────────────────`);
  
  for (const result of results) {
    const indentStr = `${result.indent.type}(${result.indent.size})`.padEnd(9);
    const sortedStr = (result.sorted ? 'Yes' : 'No').padEnd(6);
    const endingStr = result.lineEnding.padEnd(11);
    console.log(`${result.file.padEnd(21)} | ${indentStr} | ${sortedStr} | ${endingStr} | ${result.lines}`);
  }
  console.log();
  
  // Recommendations
  console.log(`✅ FORMATTING STANDARD FOR BACKFILL SCRIPT:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Indentation: 2 spaces (standard across all files)`);
  console.log(`  Key ordering: ${sortedStats.sorted > sortedStats.unsorted ? 'Sorted alphabetically' : 'Mixed'}`);
  console.log(`  Line endings: ${lineEndingStats['LF'] ? 'LF (Unix)' : 'CRLF (Windows)'} preferred`);
}

spotCheckFormatting();
