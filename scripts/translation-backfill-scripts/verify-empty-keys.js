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

function verifyEmptyKeys() {
  console.log('🔍 VERIFICATION: Checking for keys that are TRULY empty across ALL 7 locales\n');
  console.log('Definition: Key value is "" (empty string) in ALL 7 locales (including English)\n');
  
  // Collect all keys and their values per locale
  const localeData = {};
  const allKeys = new Set();
  
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
          allKeys.add(fullKey);
        }
      } catch (error) {
        console.error(`Error processing ${locale}/${namespace}: ${error.message}`);
      }
    }
  }
  
  // Find keys that are empty in ALL locales
  const consistentlyEmpty = [];
  
  for (const key of allKeys) {
    let allLocalesEmpty = true;
    const values = {};
    
    for (const locale of LOCALES) {
      const value = localeData[locale].get(key);
      values[locale] = value === undefined ? '[NOT_FOUND]' : value === '' ? '[EMPTY]' : value;
      
      if (value !== '') {
        allLocalesEmpty = false;
      }
    }
    
    if (allLocalesEmpty) {
      consistentlyEmpty.push({ key, values });
    }
  }
  
  console.log(`📊 RESULTS:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total unique keys across all locales: ${allKeys.size}`);
  console.log(`Keys that are empty in ALL 7 locales: ${consistentlyEmpty.length}`);
  console.log();
  
  if (consistentlyEmpty.length > 0) {
    console.log(`📋 TRULY CONSISTENTLY-EMPTY KEYS:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    for (let i = 0; i < consistentlyEmpty.length; i++) {
      const { key, values } = consistentlyEmpty[i];
      console.log(`${i + 1}. ${key}`);
      console.log(`   Values across locales:`);
      for (const locale of LOCALES) {
        console.log(`     ${locale}: ${values[locale]}`);
      }
      console.log();
    }
  } else {
    console.log(`⚠️  No keys found that are empty in ALL 7 locales!`);
    console.log(`This means the concept of "consistently empty" may need redefinition.`);
    console.log();
    
    // Show keys that are empty in English
    console.log(`📊 KEYS EMPTY IN ENGLISH LOCALE:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    const emptyInEnglish = [];
    for (const key of allKeys) {
      const value = localeData['en'].get(key);
      if (value === '') {
        emptyInEnglish.push(key);
      }
    }
    console.log(`Count: ${emptyInEnglish.length}`);
    if (emptyInEnglish.length > 0) {
      for (const key of emptyInEnglish.sort().slice(0, 20)) {
        console.log(`  - ${key}`);
      }
      if (emptyInEnglish.length > 20) {
        console.log(`  ... and ${emptyInEnglish.length - 20} more`);
      }
    }
  }
}

verifyEmptyKeys();
