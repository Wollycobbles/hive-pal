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

function analyzeEmptyKeys() {
  console.log('🔍 Comprehensive Empty Key Analysis\n');
  
  // Collect all keys and their values per locale
  const localeData = {};
  const allKeys = new Set();
  
  for (const locale of LOCALES) {
    localeData[locale] = { keyMap: new Map(), emptyInLocale: [] };
    
    for (const namespace of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const flattened = flattenObject(data);
        
        for (const [k, v] of flattened) {
          const fullKey = `${namespace}.${k}`;
          localeData[locale].keyMap.set(fullKey, v);
          allKeys.add(fullKey);
          
          if (v === '') {
            localeData[locale].emptyInLocale.push(fullKey);
          }
        }
      } catch (error) {
        console.error(`Error processing ${locale}/${namespace}: ${error.message}`);
      }
    }
  }
  
  // Find keys that are empty in ENGLISH (potential consistently-empty candidates)
  const emptyInEnglish = localeData['en'].emptyInLocale;
  
  console.log(`📊 EMPTY KEYS IN ENGLISH (${emptyInEnglish.length}):`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  if (emptyInEnglish.length > 0) {
    for (let i = 0; i < emptyInEnglish.length; i++) {
      console.log(`  ${i + 1}. ${emptyInEnglish[i]}`);
    }
  } else {
    console.log('  (none found)');
  }
  console.log();
  
  // Check which keys are consistently empty across ALL locales
  const consistentlyEmpty = [];
  for (const key of emptyInEnglish) {
    let allLocalesEmpty = true;
    for (const locale of LOCALES) {
      const value = localeData[locale].keyMap.get(key);
      if (value !== '') {
        allLocalesEmpty = false;
        break;
      }
    }
    if (allLocalesEmpty) {
      consistentlyEmpty.push(key);
    }
  }
  
  console.log(`📋 CONSISTENTLY EMPTY (all 7 locales): ${consistentlyEmpty.length}`);
  if (consistentlyEmpty.length > 0) {
    for (let i = 0; i < consistentlyEmpty.length; i++) {
      console.log(`  ${i + 1}. ${consistentlyEmpty[i]}`);
    }
  }
  console.log();
  
  // Show distribution
  console.log(`📈 EMPTY KEYS PER LOCALE:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  for (const locale of LOCALES) {
    console.log(`  ${locale}: ${localeData[locale].emptyInLocale.length}`);
  }
  console.log();
  
  console.log(`📊 TOTAL UNIQUE KEYS ACROSS ALL LOCALES: ${allKeys.size}`);
}

analyzeEmptyKeys();
