const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const keysToCheck = [
  { fullKey: 'apiary.form.inspectionType.dataDriven', searchTerms: ['inspectionType', 'dataDriven'] },
  { fullKey: 'apiary.form.inspectionType.description', searchTerms: ['inspectionType', 'description'] },
  { fullKey: 'apiary.form.inspectionType.label', searchTerms: ['inspectionType', 'label'] },
  { fullKey: 'apiary.form.inspectionType.placeholder', searchTerms: ['inspectionType', 'placeholder'] },
  { fullKey: 'apiary.form.inspectionType.subjective', searchTerms: ['inspectionType', 'subjective'] },
  { fullKey: 'hive.card.inspectionWarnings', searchTerms: ['inspectionWarnings', 'hive'] },
  { fullKey: 'hive.card.strength', searchTerms: ['strength', 'hive'] },
  { fullKey: 'inspection.observations.supersedureCellsDescription', searchTerms: ['supersedureCells', 'inspection'] },
  { fullKey: 'inspection.observations.swarmCellsDescription', searchTerms: ['swarmCells', 'inspection'] },
];

console.log('🔍 Advanced Key Usage Investigation\n');

const findings = [];

for (const item of keysToCheck) {
  console.log(`Investigating: ${item.fullKey}`);
  
  let found = false;
  let matchFiles = [];
  let matchLines = [];
  
  // Search for each component of the key
  for (const term of item.searchTerms) {
    try {
      // Search for translation usage pattern
      const cmd = `grep -rn "t('${item.fullKey.split('.')[0]}:" apps/frontend/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep "${term}"`;
      const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      
      if (result) {
        found = true;
        const lines = result.split('\n');
        for (const line of lines.slice(0, 2)) {
          if (line) {
            const [file, ...rest] = line.split(':');
            matchFiles.push(file);
            matchLines.push(rest.join(':'));
          }
        }
        break;
      }
    } catch {
      // No matches
    }
  }
  
  findings.push({
    key: item.fullKey,
    found,
    files: [...new Set(matchFiles)],
    lines: matchLines.slice(0, 2),
  });
  
  console.log(`  ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
}

// Now use a simpler approach - search for the namespace itself with translation patterns
console.log('\n' + '='.repeat(70));
console.log('Alternative search: Looking for namespace translation patterns\n');

const namespaces = ['apiary', 'hive', 'inspection'];
const results = {};

for (const ns of namespaces) {
  console.log(`Searching for "${ns}:" namespace translations...`);
  try {
    const cmd = `grep -rn "t('${ns}:" apps/frontend/src --include="*.ts" --include="*.tsx" 2>/dev/null`;
    const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    
    const lines = result.split('\n');
    console.log(`  Found ${lines.length} usage lines`);
    
    // Extract the translation keys being used
    const usedKeys = new Set();
    for (const line of lines) {
      const match = line.match(/t\('([^']+)'/);
      if (match) {
        usedKeys.add(match[1]);
      }
    }
    
    results[ns] = {
      totalUsages: lines.length,
      uniqueKeys: Array.from(usedKeys).sort(),
    };
    
    for (const key of results[ns].uniqueKeys.slice(0, 5)) {
      console.log(`    - ${key}`);
    }
    if (results[ns].uniqueKeys.length > 5) {
      console.log(`    ... and ${results[ns].uniqueKeys.length - 5} more`);
    }
  } catch (err) {
    console.log(`  No translations found for ${ns}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n✅ Investigation Complete\n');

// Save findings
const reportPath = path.resolve(__dirname, '../openspec/changes/add-all-translation-placeholders/translation-reference-analysis.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  keyLevelFindings: findings,
  namespaceLevelFindings: results,
}, null, 2));

console.log('Results saved to translation-reference-analysis.json');
