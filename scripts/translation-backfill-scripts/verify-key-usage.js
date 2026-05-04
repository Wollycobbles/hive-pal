#!/usr/bin/env node

/**
 * Comprehensive Translation Key Usage Investigation
 * 
 * Verifies that all 9 target translation keys are actively used in the codebase.
 * Handles multiple i18next usage patterns:
 * - t('namespace:key') - Namespace-prefixed pattern
 * - t('key') - Direct key pattern (when used with ns in config)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// The 9 keys we need to verify
const keysToCheck = [
  { 
    namespace: 'apiary', 
    key: 'form.inspectionType.dataDriven',
    searchPatterns: ['apiary:form.inspectionType.dataDriven']
  },
  { 
    namespace: 'apiary', 
    key: 'form.inspectionType.description',
    searchPatterns: ['apiary:form.inspectionType.description']
  },
  { 
    namespace: 'apiary', 
    key: 'form.inspectionType.label',
    searchPatterns: ['apiary:form.inspectionType.label']
  },
  { 
    namespace: 'apiary', 
    key: 'form.inspectionType.placeholder',
    searchPatterns: ['apiary:form.inspectionType.placeholder']
  },
  { 
    namespace: 'apiary', 
    key: 'form.inspectionType.subjective',
    searchPatterns: ['apiary:form.inspectionType.subjective']
  },
  { 
    namespace: 'hive', 
    key: 'card.inspectionWarnings',
    searchPatterns: ['hive:card.inspectionWarnings']
  },
  { 
    namespace: 'hive', 
    key: 'card.strength',
    searchPatterns: ['hive:card.strength']
  },
  { 
    namespace: 'inspection', 
    key: 'observations.supersedureCellsDescription',
    searchPatterns: ['observations.supersedureCellsDescription', 'observations:observations.supersedureCellsDescription']
  },
  { 
    namespace: 'inspection', 
    key: 'observations.swarmCellsDescription',
    searchPatterns: ['observations.swarmCellsDescription', 'observations:observations.swarmCellsDescription']
  },
];

const srcDir = 'apps/frontend/src';
const findings = [];

console.log('🔍 Comprehensive Translation Key Usage Investigation\n');
console.log('Target keys: 9');
console.log(`Search directory: ${srcDir}\n`);
console.log('='.repeat(80));

/**
 * Search for a key using multiple patterns
 */
function searchKeyUsage(keyItem) {
  const results = [];

  for (const pattern of keyItem.searchPatterns) {
    try {
      // Use grep to find the pattern
      const cmd = `grep -rn "${pattern}" ${srcDir} --include="*.ts" --include="*.tsx"`;
      const output = execSync(cmd, { 
        encoding: 'utf8', 
        maxBuffer: 10 * 1024 * 1024,
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim();

      if (output) {
        const lines = output.split('\n').filter(l => l.trim());
        for (const line of lines) {
          // Parse grep output: file:line:content
          const match = line.match(/^([^:]+):(\d+):(.*)/);
          if (match) {
            const [, file, lineNum, content] = match;
            const result = {
              file: file.replace(/\\/g, '/'),
              line: parseInt(lineNum),
              content: content.trim().substring(0, 100),
            };
            // Avoid duplicates
            if (!results.some(r => r.file === result.file && r.line === result.line)) {
              results.push(result);
            }
          }
        }
      }
    } catch (err) {
      // Pattern didn't match or error occurred, continue to next pattern
    }
  }

  return results;
}

// Investigate each key
for (const keyItem of keysToCheck) {
  const fullKey = `${keyItem.namespace}.${keyItem.key}`;
  
  console.log(`\n📋 ${fullKey}`);
  
  const results = searchKeyUsage(keyItem);
  
  if (results.length > 0) {
    console.log(`   ✅ FOUND in ${results.length} location(s)`);
    for (const result of results) {
      console.log(`      ${result.file}:${result.line}`);
      console.log(`      > ${result.content}`);
    }
  } else {
    console.log(`   ❌ NOT FOUND`);
  }

  findings.push({
    fullKey,
    namespace: keyItem.namespace,
    key: keyItem.key,
    usageFound: results.length > 0,
    codeLocations: results,
    searchPatterns: keyItem.searchPatterns,
  });
}

console.log('\n' + '='.repeat(80));
console.log('\n📊 Summary\n');

const foundCount = findings.filter(f => f.usageFound).length;
console.log(`Total keys investigated: ${findings.length}`);
console.log(`Keys found: ${foundCount}`);
console.log(`Keys NOT found: ${findings.length - foundCount}`);

if (foundCount === findings.length) {
  console.log('\n✅ SUCCESS: All keys found! Ready for backfill.\n');
} else {
  console.log('\n⚠️  WARNING: Some keys not found. Review carefully before proceeding.\n');
  console.log('Not found:');
  findings.filter(f => !f.usageFound).forEach(f => {
    console.log(`  - ${f.fullKey}`);
  });
  console.log();
}

// Save structured results
const reportPath = path.resolve(__dirname, '../openspec/changes/add-all-translation-placeholders/group2-key-usage-verification.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    totalKeys: findings.length,
    keysFound: foundCount,
    keysNotFound: findings.length - foundCount,
  },
  findings,
}, null, 2));

console.log(`📁 Detailed results saved to: openspec/changes/add-all-translation-placeholders/group2-key-usage-verification.json\n`);

// Exit with error if any keys not found
process.exit(foundCount === findings.length ? 0 : 1);
