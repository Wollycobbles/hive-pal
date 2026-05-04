const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
const LOCALES = ['en', 'da', 'de', 'fr', 'it', 'sk', 'sr'];
const NAMESPACES = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];

/**
 * Recursively find all values in JSON object
 * Returns map: keyPath -> value
 */
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

function findConsistentlyEmptyKeys() {
  console.log('🔍 Finding consistently-empty keys...\n');
  
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
  
  // Find keys that are empty in ALL locales (including English)
  const enKeys = new Set(localeData['en'].keys());
  const consistentlyEmpty = [];
  
  for (const key of enKeys) {
    const enValue = localeData['en'].get(key);
    
    if (enValue === '') {
      // Check if empty in all other locales too
      let allEmpty = true;
      for (const locale of LOCALES) {
        if (locale === 'en') continue;
        const value = localeData[locale].get(key);
        if (value !== '') {
          allEmpty = false;
          break;
        }
      }
      
      if (allEmpty) {
        consistentlyEmpty.push(key);
      }
    }
  }
  
  consistentlyEmpty.sort();
  
  console.log(`📊 CONSISTENTLY EMPTY KEY ANALYSIS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Keys empty in English AND all target locales: ${consistentlyEmpty.length}`);
  console.log();
  
  if (consistentlyEmpty.length > 0) {
    console.log(`📋 CONSISTENTLY EMPTY KEYS (${consistentlyEmpty.length}):`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    for (let i = 0; i < consistentlyEmpty.length; i++) {
      const key = consistentlyEmpty[i];
      const [ns, ...keyParts] = key.split('.');
      console.log(`  ${i + 1}. ${key}`);
    }
    console.log();
  }
  
  return consistentlyEmpty;
}

const result = findConsistentlyEmptyKeys();
