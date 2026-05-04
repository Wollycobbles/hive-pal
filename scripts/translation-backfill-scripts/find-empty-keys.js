const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
const LOCALES = ['en', 'da', 'de', 'fr', 'it', 'sk', 'sr'];
const NAMESPACES = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];

/**
 * Recursively find all empty string values in JSON object
 * Returns array of key paths like "errors.validation.required"
 */
function findEmptyKeys(obj, prefix = '') {
  const emptyKeys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string' && value === '') {
      emptyKeys.push(fullKey);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      emptyKeys.push(...findEmptyKeys(value, fullKey));
    }
  }
  
  return emptyKeys;
}

function findConsistentlyEmptyKeys() {
  console.log('🔍 Finding consistently-empty keys across all locales...\n');
  
  // Map: keyPath -> Set of locales where it exists and is empty
  const emptyKeyMap = new Map();
  
  // First pass: collect all empty keys per locale
  for (const locale of LOCALES) {
    for (const namespace of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const emptyKeys = findEmptyKeys(data);
        
        for (const key of emptyKeys) {
          const fullKey = `${namespace}.${key}`;
          if (!emptyKeyMap.has(fullKey)) {
            emptyKeyMap.set(fullKey, new Set());
          }
          emptyKeyMap.get(fullKey).add(locale);
        }
      } catch (error) {
        console.error(`Error processing ${locale}/${namespace}: ${error.message}`);
      }
    }
  }
  
  // Filter for consistently-empty keys (present in all 7 locales)
  const consistentlyEmpty = [];
  for (const [key, locales] of emptyKeyMap.entries()) {
    if (locales.size === 7) {
      consistentlyEmpty.push(key);
    }
  }
  
  consistentlyEmpty.sort();
  
  console.log(`📊 EMPTY KEY ANALYSIS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total unique empty key paths: ${emptyKeyMap.size}`);
  console.log(`Consistently empty (all 7 locales): ${consistentlyEmpty.length}`);
  console.log();
  
  if (consistentlyEmpty.length > 0) {
    console.log(`📋 CONSISTENTLY EMPTY KEYS (${consistentlyEmpty.length}):`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    for (let i = 0; i < consistentlyEmpty.length; i++) {
      console.log(`  ${i + 1}. ${consistentlyEmpty[i]}`);
    }
    console.log();
  }
  
  // Show distribution of empty keys per locale
  console.log(`📈 EMPTY KEYS PER LOCALE:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  for (const locale of LOCALES) {
    const count = Array.from(emptyKeyMap.values()).filter(locales => locales.has(locale)).length;
    console.log(`  ${locale}: ${count} empty keys`);
  }
  console.log();
  
  return consistentlyEmpty;
}

const result = findConsistentlyEmptyKeys();
process.exit(result.length === 9 ? 0 : 1);
