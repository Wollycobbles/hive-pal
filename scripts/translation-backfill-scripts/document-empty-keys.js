const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
const LOCALES = ['en', 'da', 'de', 'fr', 'it', 'sk', 'sr'];
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

function documentEmptyKeys() {
  console.log('🔍 Documenting consistently-empty keys\n');
  
  // Collect all keys and their values per locale
  const localeData = {};
  
  for (const locale of LOCALES) {
    localeData[locale] = new Map();
    
    for (const namespace of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const flattened = flattenObject(data);
        
        for (const [k, v] of flattened) {
          const fullKey = `${namespace}.${k}`;
          localeData[locale].set(fullKey, v);
        }
      } catch (error) {
        console.error(`Error processing ${locale}/${namespace}: ${error.message}`);
      }
    }
  }
  
  // Find keys that are empty in ALL locales
  const allKeys = new Set();
  for (const keyMap of Object.values(localeData)) {
    for (const key of keyMap.keys()) {
      allKeys.add(key);
    }
  }
  
  const consistentlyEmpty = [];
  
  for (const key of allKeys) {
    let allEmpty = true;
    for (const locale of LOCALES) {
      const value = localeData[locale].get(key);
      if (value === undefined || value !== '') {
        allEmpty = false;
        break;
      }
    }
    if (allEmpty) {
      consistentlyEmpty.push(key);
    }
  }
  
  consistentlyEmpty.sort();
  
  console.log(`📋 CONSISTENTLY EMPTY KEYS (${consistentlyEmpty.length}):`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log();
  
  if (consistentlyEmpty.length > 0) {
    for (let i = 0; i < consistentlyEmpty.length; i++) {
      const key = consistentlyEmpty[i];
      console.log(`${i + 1}. **${key}**`);
      console.log(`   - Location: ${key.substring(0, key.lastIndexOf('.'))}.json`);
      console.log(`   - Key path: ${key.split('.').slice(1).join('.')}`);
      console.log();
    }
    
    // Create report file
    const reportPath = path.join(__dirname, '../openspec/changes/add-all-translation-placeholders/empty-keys-report.md');
    
    let report = `# Consistently-Empty Keys Documentation\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `Found **${consistentlyEmpty.length}** keys that are consistently empty (empty string value "") across all 7 locales.\n\n`;
    report += `## Keys Requiring Investigation\n\n`;
    report += `| # | Key | Namespace | Key Path | Status |\n`;
    report += `|---|-----|-----------|----------|--------|\n`;
    
    for (let i = 0; i < consistentlyEmpty.length; i++) {
      const key = consistentlyEmpty[i];
      const parts = key.split('.');
      const namespace = parts[0];
      const keyPath = parts.slice(1).join('.');
      report += `| ${i + 1} | \`${key}\` | ${namespace} | ${keyPath} | TODO: Investigate |\n`;
    }
    
    report += `\n## Next Steps\n\n`;
    report += `1. For each key, search codebase for usage patterns:\n`;
    report += `   - \`t('${consistentlyEmpty[0]}'\)\` (React i18next hook)\n`;
    report += `   - \`useTranslation\` patterns\n`;
    report += `   - Function component imports\n\n`;
    report += `2. Document findings:\n`;
    report += `   - If found: Mark as "Actively Used" - investigate intended behavior\n`;
    report += `   - If not found: Mark as "Orphaned" - consider removal\n\n`;
    report += `3. Update this report with findings before proceeding with backfill\n`;
    
    fs.writeFileSync(reportPath, report);
    console.log(`✅ Report saved to: empty-keys-report.md`);
  }
}

documentEmptyKeys();
