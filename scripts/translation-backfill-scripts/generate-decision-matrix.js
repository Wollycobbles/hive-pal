#!/usr/bin/env node

/**
 * Generate Decision Matrix for Translation Key Backfill
 * 
 * Creates machine-readable JSON output indicating which keys should be filled
 * with English placeholders vs. left empty.
 * 
 * Input: group2-key-usage-verification.json
 * Output: group2-decision-matrix.json
 */

const fs = require('fs');
const path = require('path');

// Read the key usage verification results
const verificationPath = path.resolve(__dirname, '../openspec/changes/add-all-translation-placeholders/group2-key-usage-verification.json');
const verificationData = JSON.parse(fs.readFileSync(verificationPath, 'utf8'));

console.log('📊 Generating Decision Matrix for Translation Backfill\n');
console.log('Input: group2-key-usage-verification.json');
console.log(`Found ${verificationData.summary.keysFound} keys actively used in code\n`);
console.log('='.repeat(80));

// Build decision matrix
const decisions = {};
const matrix = [];

for (const finding of verificationData.findings) {
  const decision = {
    fullKey: finding.fullKey,
    namespace: finding.namespace,
    key: finding.key,
    usageStatus: finding.usageFound ? 'ACTIVELY_USED' : 'NOT_FOUND_IN_CODE',
    usageLocations: finding.codeLocations.length,
    firstUsage: finding.codeLocations.length > 0 
      ? `${finding.codeLocations[0].file}:${finding.codeLocations[0].line}`
      : null,
    backfillAction: finding.usageFound ? 'FILL' : 'SKIP',
    reasoning: finding.usageFound 
      ? 'Key is actively used in UI. Missing translations will cause untranslated content to be visible to users.'
      : 'Key not found in codebase. May be unused or deprecated. Safe to leave empty.',
    edgeCases: finding.usageFound ? 'None - straightforward backfill' : 'Review before proceeding',
  };

  decisions[finding.fullKey] = {
    action: decision.backfillAction,
    reason: decision.reasoning,
  };

  matrix.push(decision);

  console.log(`\n✓ ${finding.fullKey}`);
  console.log(`  Status: ${decision.usageStatus}`);
  console.log(`  Action: ${decision.backfillAction}`);
  if (decision.firstUsage) {
    console.log(`  Usage: ${decision.firstUsage}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n📈 Summary\n');

const fillCount = matrix.filter(m => m.backfillAction === 'FILL').length;
const skipCount = matrix.filter(m => m.backfillAction === 'SKIP').length;

console.log(`Total keys: ${matrix.length}`);
console.log(`To FILL: ${fillCount}`);
console.log(`To SKIP: ${skipCount}`);

if (skipCount === 0) {
  console.log('\n✅ All keys ready for backfill - no edge cases detected.\n');
} else {
  console.log('\n⚠️  Some keys marked SKIP - review carefully.\n');
  matrix.filter(m => m.backfillAction === 'SKIP').forEach(m => {
    console.log(`  - ${m.fullKey}`);
  });
  console.log();
}

// Save decision matrix (compact for Group 3 consumption)
const decisionMatrixPath = path.resolve(__dirname, '../openspec/changes/add-all-translation-placeholders/group2-decision-matrix.json');
fs.writeFileSync(decisionMatrixPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    totalKeys: matrix.length,
    keysToBeFilled: fillCount,
    keysToSkip: skipCount,
  },
  decisions,
}, null, 2));

console.log(`📁 Decision matrix saved to: openspec/changes/add-all-translation-placeholders/group2-decision-matrix.json`);

// Save detailed matrix (for human review)
const detailedMatrixPath = path.resolve(__dirname, '../openspec/changes/add-all-translation-placeholders/group2-decision-matrix-detailed.json');
fs.writeFileSync(detailedMatrixPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    totalKeys: matrix.length,
    keysToBeFilled: fillCount,
    keysToSkip: skipCount,
  },
  matrix,
}, null, 2));

console.log(`📁 Detailed matrix saved to: openspec/changes/add-all-translation-placeholders/group2-decision-matrix-detailed.json\n`);

process.exit(0);
