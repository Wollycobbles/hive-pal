const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');

function analyzeFullFormatting() {
  console.log('🔍 Detailed formatting analysis\n');
  
  // Check a few complete files to understand pattern
  const testFiles = [
    ['en', 'common'],
    ['en', 'inspection'],
    ['da', 'admin'],
    ['fr', 'auth'],
    ['it', 'common'],
  ];
  
  for (const [locale, namespace] of testFiles) {
    const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`\n📄 ${locale}/${namespace}.json`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    // Sample first 20 lines to see indentation pattern
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i];
      if (line.trim()) {
        // Count leading spaces
        const match = line.match(/^( *)/);
        const spaces = match ? match[1].length : 0;
        const indent = spaces > 0 ? `[${spaces} spaces]` : '[no indent]';
        console.log(`${indent.padEnd(15)} | ${line.substring(0, 60)}`);
      }
    }
  }
}

analyzeFullFormatting();
