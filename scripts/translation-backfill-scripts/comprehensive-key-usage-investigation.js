const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// The 9 keys identified in Group 1 as empty in target locales
const keysToInvestigate = [
  'apiary.form.inspectionType.dataDriven',
  'apiary.form.inspectionType.description',
  'apiary.form.inspectionType.label',
  'apiary.form.inspectionType.placeholder',
  'apiary.form.inspectionType.subjective',
  'hive.card.inspectionWarnings',
  'hive.card.strength',
  'inspection.observations.supersedureCellsDescription',
  'inspection.observations.swarmCellsDescription',
];

function searchKeyUsage(fullKey) {
  // Try different search patterns
  const patterns = [
    fullKey,  // Exact match
    fullKey.split('.').slice(1).join(''),  // Without namespace
  ];
  
  let found = false;
  let locations = [];
  
  for (const pattern of patterns) {
    try {
      // Use grep to search in typescript files
      const cmd = `grep -rn "${pattern}" G:\HivePalBranches\newinspectionflow\hive-pal\apps\frontend\src --include="*.ts" --include="*.tsx" 2>/dev/null`;
      const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
      
      if (result) {
        found = true;
        const lines = result.split('\n');
        for (let i = 0; i < Math.min(3, lines.length); i++) {
          const line = lines[i];
          if (line.includes(`t('`) || line.includes(`t("`)) {
            locations.push(line.substring(0, 120));
          }
        }
        break;
      }
    } catch {
      // No matches for this pattern
    }
  }
  
  return { found, locations };
}

function investigateAllKeys() {
  console.log('🔍 Task 2.2 & 2.3: Comprehensive Key Usage Investigation\n');
  console.log(`Investigating ${keysToInvestigate.length} keys from Group 1 findings\n`);
  
  const findings = [];
  const keysByNamespace = {};
  
  for (const key of keysToInvestigate) {
    process.stdout.write(`Searching: ${key}... `);
    
    const result = searchKeyUsage(key);
    const [namespace] = key.split('.');
    
    if (!keysByNamespace[namespace]) {
      keysByNamespace[namespace] = [];
    }
    keysByNamespace[namespace].push({ key, ...result });
    
    findings.push({
      key,
      namespace,
      found: result.found,
      locations: result.locations,
    });
    
    console.log(result.found ? '✅ FOUND' : '❌ NOT FOUND');
  }
  
  // Generate report
  const foundCount = findings.filter(f => f.found).length;
  const notFoundCount = findings.filter(f => !f.found).length;
  
  console.log('\n' + '━'.repeat(70));
  console.log('✅ INVESTIGATION COMPLETE\n');
  console.log(`Total keys investigated: ${findings.length}`);
  console.log(`Found in code:          ${foundCount} (${((foundCount/findings.length)*100).toFixed(1)}%)`);
  console.log(`NOT found in code:      ${notFoundCount} (${((notFoundCount/findings.length)*100).toFixed(1)}%)`);
  console.log('');
  
  // Group by namespace
  console.log('📊 FINDINGS BY NAMESPACE:\n');
  for (const [namespace, keys] of Object.entries(keysByNamespace)) {
    const nsFound = keys.filter(k => k.found).length;
    console.log(`${namespace.toUpperCase()}: ${nsFound}/${keys.length} found`);
    for (const keyData of keys) {
      const status = keyData.found ? '✅' : '❌';
      console.log(`  ${status} ${keyData.key.split('.').slice(1).join('.')}`);
      if (keyData.locations.length > 0) {
        console.log(`     Usage: ${keyData.locations[0].substring(0, 100)}`);
      }
    }
    console.log();
  }
  
  return findings;
}

const findings = investigateAllKeys();

// Save detailed findings
const reportPath = path.resolve(__dirname, '../openspec/changes/add-all-translation-placeholders/group2-investigation-results.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalInvestigated: findings.length,
  totalFound: findings.filter(f => f.found).length,
  totalNotFound: findings.filter(f => !f.found).length,
  findings: findings.map(f => ({
    key: f.key,
    namespace: f.namespace,
    usageFound: f.found,
    codeLocations: f.locations,
    recommendation: f.found ? 'FILL - Actively used in code' : 'CONSIDER_EMPTY - Not actively used',
  })),
}, null, 2));

console.log(`✅ Results saved to: group2-investigation-results.json`);
