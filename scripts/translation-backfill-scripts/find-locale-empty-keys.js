const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');

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

function findLocaleEmptyKeys() {
  console.log('🔍 Finding empty keys in each locale\n');
  
  const locales = ['da', 'de', 'fr', 'it', 'sk', 'sr'];
  const namespaces = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];
  
  // Collect English for reference
  const enData = new Map();
  for (const namespace of namespaces) {
    const filePath = path.join(LOCALES_DIR, 'en', `${namespace}.json`);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const flattened = flattenObject(data);
    for (const [k, v] of flattened) {
      enData.set(`${namespace}.${k}`, v);
    }
  }
  
  const emptyKeysByLocale = {};
  
  for (const locale of locales) {
    const localeEmptyKeys = new Set();
    
    for (const namespace of namespaces) {
      const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const flattened = flattenObject(data);
      
      for (const [k, v] of flattened) {
        const fullKey = `${namespace}.${k}`;
        if (v === '') {
          localeEmptyKeys.add(fullKey);
        }
      }
    }
    
    emptyKeysByLocale[locale] = Array.from(localeEmptyKeys).sort();
  }
  
  // Find common empty keys across target locales
  let commonEmpty = new Set(emptyKeysByLocale['da']);
  for (const locale of locales) {
    const keysInLocale = new Set(emptyKeysByLocale[locale]);
    commonEmpty = new Set([...commonEmpty].filter(k => keysInLocale.has(k)));
  }
  
  console.log(`📋 EMPTY KEYS ANALYSIS BY LOCALE:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  for (const locale of locales) {
    console.log(`${locale.toUpperCase()}: ${emptyKeysByLocale[locale].length} empty keys`);
    for (const key of emptyKeysByLocale[locale]) {
      const enValue = enData.get(key);
      const mark = key.includes('placeholder') ? ' [PLACEHOLDER]' : '';
      console.log(`  - ${key}${mark}`);
    }
    console.log();
  }
  
  console.log(`\n📊 COMMON EMPTY KEYS (in multiple locales): ${commonEmpty.size}`);
  if (commonEmpty.size > 0) {
    const commonList = Array.from(commonEmpty).sort();
    for (let i = 0; i < commonList.length; i++) {
      const key = commonList[i];
      const localesWithEmpty = [];
      for (const locale of locales) {
        if (emptyKeysByLocale[locale].includes(key)) {
          localesWithEmpty.push(locale);
        }
      }
      console.log(`  ${i + 1}. ${key} (in: ${localesWithEmpty.join(', ')})`);
    }
  }
}

findLocaleEmptyKeys();
