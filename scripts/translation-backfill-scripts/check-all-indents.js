const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
const LOCALES = ['en', 'da', 'de', 'fr', 'it', 'sk', 'sr'];
const NAMESPACES = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];

function detectPrimaryIndentation(content) {
  const lines = content.split('\n');
  const indents = {};
  
  for (const line of lines) {
    if (line.trim() && !line.trim().startsWith('}') && !line.trim().startsWith(']')) {
      const match = line.match(/^( +)/);
      if (match) {
        const spaces = match[1].length;
        // Only count if it looks like it could be a level indent (2, 4, or 6)
        if (spaces % 2 === 0 && spaces <= 8) {
          indents[spaces] = (indents[spaces] || 0) + 1;
        }
      }
    }
  }
  
  // Find most common indent size
  let mostCommon = 2;
  let maxCount = 0;
  for (const [size, count] of Object.entries(indents)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = parseInt(size);
    }
  }
  
  return mostCommon;
}

function analyzeAllIndents() {
  console.log('🔍 Analyzing indentation across ALL files\n');
  
  const indentStats = {};
  
  for (const locale of LOCALES) {
    for (const namespace of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const indent = detectPrimaryIndentation(content);
        
        const key = `${indent}-space`;
        indentStats[key] = (indentStats[key] || 0) + 1;
      } catch (error) {
        console.error(`Error: ${locale}/${namespace}`);
      }
    }
  }
  
  console.log(`📊 INDENTATION SUMMARY (56 files):`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  for (const [indent, count] of Object.entries(indentStats).sort()) {
    const percentage = ((count / 56) * 100).toFixed(0);
    console.log(`  ${indent}: ${count} files (${percentage}%)`);
  }
  
  console.log();
  console.log(`✅ RECOMMENDATION FOR BACKFILL SCRIPT:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Detect indentation from source English file`);
  console.log(`  Use JSON.stringify with detected indent size`);
  console.log(`  This preserves original formatting style per namespace`);
}

analyzeAllIndents();
