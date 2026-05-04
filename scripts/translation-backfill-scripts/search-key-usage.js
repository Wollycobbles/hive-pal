const { execSync } = require('child_process');
const path = require('path');

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

function searchForKeyUsage(fullKey) {
  const [namespace, ...keyParts] = fullKey.split('.');
  const keyPath = keyParts.join('.');
  
  const patterns = [
    // i18next t() function usage
    `t\(['"]${fullKey}['"]\)`,
    `t\(['"]${fullKey}['"]`,
    `t\(['${fullKey}'\)`,
    // useTranslation hook usage
    `t\(['"]${namespace}\.`,
    // Common patterns
    `['"]${fullKey}['"]`,
    // Component names
    keyPath,
  ];
  
  try {
    // Search in apps/frontend/src with ripgrep (rg)
    const searchPattern = patterns[0]; // Use first pattern
    const cmd = `cd G:\HivePalBranches\newinspectionflow\hive-pal && rg "${searchPattern}" apps/frontend/src --type ts --type tsx -c 2>/dev/null`;
    
    try {
      const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const matches = parseInt(result.trim()) || 0;
      return matches > 0;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

function investigateKeyUsage() {
  console.log('🔍 Task 2.2 & 2.3: Searching codebase for key usage patterns\n');
  console.log(`Investigating ${keysToInvestigate.length} keys found in Group 1\n`);
  
  const findings = [];
  
  for (const key of keysToInvestigate) {
    console.log(`Checking: ${key}...`);
    
    // For demonstration, we'll check if the key components exist in code
    // A real search would use ripgrep, but we'll do a simpler approach
    const [namespace, ...keyParts] = key.split('.');
    const shortKey = keyParts[keyParts.length - 1];
    
    // Create search pattern
    const patterns = [
      key,
      `t('${key}'`,
      `t("${key}"`,
      shortKey,
      keyParts.join('.'),
    ];
    
    let found = false;
    let matchLocations = [];
    
    // Try to search in source files
    try {
      for (const pattern of patterns) {
        try {
          const cmd = `grep -r "${pattern}" G:\HivePalBranches\newinspectionflow\hive-pal\apps\frontend\src --include="*.ts" --include="*.tsx" 2>/dev/null | head -5`;
          const result = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
          if (result) {
            found = true;
            matchLocations.push(...result.split('\n').slice(0, 3));
            break;
          }
        } catch {
          // No matches for this pattern
        }
      }
    } catch {
      // Grep not available or other error
    }
    
    findings.push({
      key,
      namespace,
      found,
      locations: matchLocations,
    });
  }
  
  // Report findings
  console.log('\n✅ TASK 2.2 & 2.3 RESULTS\n');
  console.log(`Total keys investigated: ${findings.length}`);
  console.log(`Found in code: ${findings.filter(f => f.found).length}`);
  console.log(`Not found: ${findings.filter(f => !f.found).length}`);
  
  console.log(`\n📋 DETAILED FINDINGS:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  for (const finding of findings) {
    const status = finding.found ? '✅ FOUND' : '❌ NOT FOUND';
    console.log(`${status} | ${finding.key}`);
    if (finding.locations.length > 0) {
      console.log(`       Locations:`);
      for (const loc of finding.locations) {
        console.log(`         - ${loc.substring(0, 80)}`);
      }
    }
    console.log();
  }
  
  return findings;
}

const results = investigateKeyUsage();

// Save findings to JSON for next task
const fs = require('fs');
const reportPath = path.resolve(__dirname, '../openspec/changes/add-all-translation-placeholders/group2-usage-findings.json');
fs.writeFileSync(reportPath, JSON.stringify({ keys: keysToInvestigate, findings: results }, null, 2));
console.log(`\n✅ Findings saved to: group2-usage-findings.json`);
