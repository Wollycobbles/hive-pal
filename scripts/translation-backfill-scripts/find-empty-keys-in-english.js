const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
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

function findEmptyKeysInEnglish() {
  console.log('🔍 Task 2.1: Finding all keys with value "" in English locale\n');
  
  const emptyKeys = [];
  
  for (const namespace of NAMESPACES) {
    const filePath = path.join(LOCALES_DIR, 'en', `${namespace}.json`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      const flattened = flattenObject(data);
      
      for (const [key, value] of flattened) {
        if (value === '') {
          const fullKey = `${namespace}.${key}`;
          emptyKeys.push(fullKey);
        }
      }
    } catch (error) {
      console.error(`Error processing en/${namespace}: ${error.message}`);
    }
  }
  
  emptyKeys.sort();
  
  console.log(`✅ TASK 2.1 RESULTS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total keys with empty string value in English: ${emptyKeys.length}`);
  console.log();
  
  if (emptyKeys.length > 0) {
    console.log(`🔴 EMPTY KEYS FOUND IN ENGLISH:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    for (let i = 0; i < emptyKeys.length; i++) {
      console.log(`  ${i + 1}. ${emptyKeys[i]}`);
    }
  } else {
    console.log(`✅ CONFIRMED: No empty keys found in English locale`);
    console.log(`   All English locale keys have non-empty values`);
  }
  
  console.log();
  console.log(`📊 SUMMARY FOR GROUP 2 INVESTIGATION:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Keys to investigate in this group: ${emptyKeys.length}`);
  console.log(`Specification requirement met: ${emptyKeys.length === 0 ? '✅ YES' : '❌ NO'}`);
  console.log();
  console.log(`Note: Per Group 1 findings, there are 9 keys that are empty in`);
  console.log(`      target locales but have English values. These are NOT`);
  console.log(`      included here (they're not empty in English).`);
  
  return emptyKeys;
}

const result = findEmptyKeysInEnglish();
process.exit(result.length === 0 ? 0 : 1);
