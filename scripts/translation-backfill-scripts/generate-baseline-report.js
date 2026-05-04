const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
const TARGET_LOCALES = ['da', 'de', 'fr', 'it', 'sk', 'sr'];
const NAMESPACES = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];

function flattenObject(obj, prefix = '') {
  const result = new Map();
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      result.set(fullKey, value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nested = flattenObject(value, fullKey);
      for (const [k, v] of nested) {
        result.set(k, v);
      }
    }
  }
  
  return result;
}

function generateBaselineReport() {
  console.log('📊 Generating baseline report of missing keys\n');
  
  // Load English baseline for all namespaces
  const englishData = {};
  for (const namespace of NAMESPACES) {
    const filePath = path.join(LOCALES_DIR, 'en', `${namespace}.json`);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    englishData[namespace] = flattenObject(data);
  }
  
  // Analyze each target locale
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTargetLocales: TARGET_LOCALES.length,
      totalNamespaces: NAMESPACES.length,
      totalEnglishKeys: 0,
      totalMissingKeys: 0,
      detailedByLocale: {}
    },
    namespaceBreakdown: {}
  };
  
  // Calculate total English keys
  for (const namespace of NAMESPACES) {
    report.summary.totalEnglishKeys += englishData[namespace].size;
    report.namespaceBreakdown[namespace] = {
      englishKeyCount: englishData[namespace].size,
      missingByLocale: {}
    };
  }
  
  // Analyze each target locale and namespace
  for (const locale of TARGET_LOCALES) {
    report.summary.detailedByLocale[locale] = {
      totalMissing: 0,
      byNamespace: {}
    };
    
    for (const namespace of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const localeData = flattenObject(data);
      
      // Find missing keys (in English but not in locale, or empty string)
      let missingCount = 0;
      const missingKeys = [];
      
      for (const [enKey, enValue] of englishData[namespace]) {
        const localeValue = localeData.get(enKey);
        
        // Missing if: key doesn't exist OR value is empty string
        if (!localeData.has(enKey) || localeValue === '') {
          missingCount++;
          missingKeys.push(enKey);
        }
      }
      
      report.summary.detailedByLocale[locale].totalMissing += missingCount;
      report.summary.detailedByLocale[locale].byNamespace[namespace] = missingCount;
      report.namespaceBreakdown[namespace].missingByLocale[locale] = missingCount;
    }
    
    report.summary.totalMissingKeys += report.summary.detailedByLocale[locale].totalMissing;
  }
  
  // Print console report
  console.log(`✅ BASELINE REPORT - MISSING TRANSLATION KEYS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  console.log(`📊 SUMMARY:`);
  console.log(`  Total target locales: ${report.summary.totalTargetLocales}`);
  console.log(`  Total namespaces: ${report.summary.totalNamespaces}`);
  console.log(`  Total English keys (baseline): ${report.summary.totalEnglishKeys}`);
  console.log(`  Total missing keys across all locales: ${report.summary.totalMissingKeys}`);
  console.log();
  
  // Missing per locale
  console.log(`📈 MISSING KEYS BY LOCALE:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  for (const locale of TARGET_LOCALES) {
    const missing = report.summary.detailedByLocale[locale].totalMissing;
    const percentage = ((missing / report.summary.totalEnglishKeys) * 100).toFixed(1);
    console.log(`  ${locale}: ${missing.toString().padStart(4)} missing (${percentage}%)`);
  }
  console.log();
  
  // Missing per namespace
  console.log(`📊 MISSING KEYS BY NAMESPACE:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Namespace  | Keys | da | de | fr | it | sk | sr | Total Missing`);
  console.log(`───────────────────────────────────────────────────────────────`);
  
  for (const namespace of NAMESPACES) {
    const enCount = report.namespaceBreakdown[namespace].englishKeyCount;
    const breakdown = report.namespaceBreakdown[namespace].missingByLocale;
    const total = TARGET_LOCALES.reduce((sum, loc) => sum + breakdown[loc], 0);
    
    const row = `${namespace.padEnd(10)} | ${enCount.toString().padStart(4)} | ${breakdown.da.toString().padStart(2)} | ${breakdown.de.toString().padStart(2)} | ${breakdown.fr.toString().padStart(2)} | ${breakdown.it.toString().padStart(2)} | ${breakdown.sk.toString().padStart(2)} | ${breakdown.sr.toString().padStart(2)} | ${total.toString().padStart(3)}`;
    console.log(row);
  }
  console.log();
  
  // Detailed matrix
  console.log(`📋 DETAILED MATRIX - Missing Keys per Locale/Namespace:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log();
  
  for (const locale of TARGET_LOCALES) {
    console.log(`${locale.toUpperCase()} Locale:`);
    const total = report.summary.detailedByLocale[locale].totalMissing;
    for (const namespace of NAMESPACES) {
      const missing = report.summary.detailedByLocale[locale].byNamespace[namespace];
      if (missing > 0) {
        const bar = '█'.repeat(Math.ceil(missing / 5)) + '░'.repeat(Math.max(0, 20 - Math.ceil(missing / 5)));
        console.log(`  ${namespace.padEnd(12)}: ${missing.toString().padStart(3)} missing ${bar}`);
      } else {
        console.log(`  ${namespace.padEnd(12)}: ${missing.toString().padStart(3)} missing`);
      }
    }
    console.log(`  TOTAL: ${total}`);
    console.log();
  }
  
  // Verify total
  console.log(`✅ VERIFICATION:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Expected: 1,445 missing keys`);
  console.log(`Found:    ${report.summary.totalMissingKeys} missing keys`);
  console.log(`Status:   ${report.summary.totalMissingKeys === 1445 ? '✅ CONFIRMED' : '⚠️ MISMATCH'}`);
  console.log();
  
  // Save detailed JSON report
  const reportPath = path.join(__dirname, '../openspec/changes/add-all-translation-placeholders/baseline-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📁 Full report saved to: baseline-report.json`);
}

generateBaselineReport();
