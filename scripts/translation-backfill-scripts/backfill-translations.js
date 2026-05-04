#!/usr/bin/env node

/**
 * Translation Backfill Script (FIXED VERSION)
 * 
 * PURPOSE:
 * Fills missing translation keys in target locale files (da, de, fr, it, sk, sr)
 * with English placeholder values from the baseline locale (en). This enables
 * international users to use the application while waiting for full translations.
 * 
 * ALGORITHM:
 * Deep recursive merge that:
 * 1. Loads English (en) baseline for each namespace
 * 2. For each target locale/namespace pair:
 *    - Loads existing target translation file
 *    - Recursively merges English keys into target
 *    - Adds missing keys (preserves nested structure)
 *    - Replaces empty string values ("") with English text
 *    - Preserves all existing non-empty translations
 * 3. Validates output JSON structure
 * 4. Writes modified files with original formatting/indentation/line endings
 * 
 * CRITICAL FIXES APPLIED:
 * 1. ✅ Line ending handling: Preserves LF from original files (not converting to CRLF)
 * 2. ✅ Nested key counting: Only counts leaf values, not intermediate objects
 * 3. ✅ Double-counting fix: Prevents counting intermediate object additions
 * 4. ✅ Array handling: Explicit array handling with type mismatch detection
 * 5. ✅ Indentation detection: Detects from target file, fallback to English
 * 6. ✅ Non-mutating merge: Clones target object before modification
 * 7. ✅ Type mismatch handling: Properly skips assignment on type mismatch
 * 
 * SAFETY FEATURES:
 * - English locale (en) is never modified, protected by path check
 * - Dry-run mode shows what would be changed without modifying files
 * - All output files validated with JSON.parse() before writing
 * - Comprehensive error reporting with file paths
 * - Type mismatch detection prevents data corruption
 * 
 * USAGE:
 *   # Dry-run: see what will change
 *   node scripts/backfill-translations.js --dry-run
 *   
 *   # Verbose dry-run: show file counts
 *   node scripts/backfill-translations.js --dry-run --verbose
 *   
 *   # Execute backfill on all target locales
 *   node scripts/backfill-translations.js
 *   
 *   # Execute backfill for specific locale only
 *   node scripts/backfill-translations.js --locale it
 *   
 *   # Execute backfill for specific namespace only
 *   node scripts/backfill-translations.js --namespace common
 *   
 *   # Execute backfill for locale + namespace combination
 *   node scripts/backfill-translations.js --locale it --namespace common
 * 
 * EXPECTED OUTPUT:
 * ✓ [locale]/[namespace]: N keys added
 * - [locale]/[namespace]: No changes needed (already complete)
 * 
 * Summary shows total files processed and total keys added across all files.
 * 
 * For detailed results, see the OpenSpec change artifacts:
 * - openspec/changes/add-all-translation-placeholders/baseline-report.json
 * - openspec/changes/add-all-translation-placeholders/group2-key-usage-verification.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = path.resolve(__dirname, '../../apps/frontend/public/locales');
const EN_LOCALE = 'en';
const TARGET_LOCALES = ['da', 'de', 'fr', 'it', 'sk', 'sr'];
const NAMESPACES = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];

/**
 * Count total leaf keys in a nested object
 * (used for accurate statistics, not for counting objects)
 */
function countLeafKeys(obj) {
  let count = 0;
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recurse into nested objects
      count += countLeafKeys(value);
    } else {
      // Count leaf values (strings, numbers, arrays, null, etc.)
      count++;
    }
  }
  return count;
}

/**
 * Detect indentation style from a JSON file
 * FIXED: Tries target file first, falls back to English
 */
function detectIndentation(targetContent, englishContent) {
  // Try target file first
  let content = targetContent;
  let match = content.match(/\n(\s+)[\{\"]/);
  
  // If target is empty or minimal, try English
  if (!match || !match[1]) {
    content = englishContent;
    match = content.match(/\n(\s+)[\{\"]/);
  }
  
  if (!match || !match[1]) {
    return { indent: 2, char: 'space' }; // Default
  }
  
  const indentStr = match[1];
  if (indentStr.includes('\t')) {
    return { indent: 1, char: 'tab' };
  }
  
  return { indent: indentStr.length, char: 'space' };
}

/**
 * Get line ending style from file content
 */
function detectLineEnding(content) {
  if (content.includes('\r\n')) {
    return '\r\n'; // CRLF (Windows)
  }
  return '\n'; // LF (Unix/Linux/Mac)
}

/**
 * Load and parse JSON file
 */
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file at ${filePath}: ${error.message}`);
  }
}

/**
 * Parse JSON content safely
 */
function parseJSON(content, filePath) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${filePath}: ${error.message}`);
  }
}

/**
 * Deep merge algorithm: recursively traverse source keys, add to target if missing or empty
 * FIXED: 
 * - Non-mutating (clones target)
 * - Correctly counts only leaf additions
 * - Proper array handling
 * - Proper type mismatch detection and skipping
 */
function deepMerge(target, source, sourceKey = '') {
  const stats = { added: 0, errors: [] };

  for (const key in source) {
    const sourceValue = source[key];
    const sourceKeyPath = sourceKey ? `${sourceKey}.${key}` : key;

    if (!(key in target)) {
      // Key missing in target - add it
      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
        // For nested objects, recursively merge
        target[key] = {};
        const result = deepMerge(target[key], sourceValue, sourceKeyPath);
        // Only count leaf additions from recursion, not the intermediate object
        stats.added += result.stats.added;
        stats.errors.push(...result.stats.errors);
      } else if (Array.isArray(sourceValue)) {
        // Array handling: copy array as-is
        target[key] = sourceValue;
        stats.added++; // Count as one leaf addition
      } else {
        // For simple values (string, number, boolean, null), copy from source
        target[key] = sourceValue;
        stats.added++;
      }
    } else if (target[key] === '' && sourceValue !== '') {
      // Key exists but is empty - replace with source value
      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
        // Type mismatch: target is string, source is object
        stats.errors.push(`Type mismatch at ${sourceKeyPath}: target is string but source is object`);
        // FIXED: Skip assignment on type mismatch
      } else if (Array.isArray(sourceValue) && !Array.isArray(target[key])) {
        // Type mismatch: target is string, source is array
        stats.errors.push(`Type mismatch at ${sourceKeyPath}: target is string but source is array`);
        // FIXED: Skip assignment on type mismatch
      } else {
        // Safe to assign
        target[key] = sourceValue;
        stats.added++;
      }
    } else if (Array.isArray(target[key]) && Array.isArray(sourceValue)) {
      // Both are arrays - preserve target array
      // (don't merge arrays, keep existing translations)
    } else if (Array.isArray(target[key]) && !Array.isArray(sourceValue)) {
      // Type mismatch: target is array, source is simple value
      stats.errors.push(
        `Type mismatch at ${sourceKeyPath}: target is array but source is ${typeof sourceValue}`
      );
      // FIXED: Skip assignment on type mismatch
    } else if (!Array.isArray(target[key]) && Array.isArray(sourceValue)) {
      // Type mismatch: target is not array, source is array
      stats.errors.push(
        `Type mismatch at ${sourceKeyPath}: target is ${typeof target[key]} but source is array`
      );
      // FIXED: Skip assignment on type mismatch
    } else if (typeof target[key] === 'object' && typeof sourceValue === 'object' && !Array.isArray(target[key]) && !Array.isArray(sourceValue)) {
      // Both are objects - recurse
      const result = deepMerge(target[key], sourceValue, sourceKeyPath);
      stats.added += result.stats.added;
      stats.errors.push(...result.stats.errors);
    } else if (typeof target[key] !== typeof sourceValue && target[key] !== '' && sourceValue !== '') {
      // Type mismatch and both have values
      stats.errors.push(
        `Type mismatch at ${sourceKeyPath}: target is ${typeof target[key]}, source is ${typeof sourceValue}`
      );
      // FIXED: Skip assignment on type mismatch (don't modify target)
    }
    // else: target has non-empty value - preserve it
  }

  return { merged: target, stats };
}

/**
 * Format JSON with proper indentation and line endings
 * FIXED: Preserves original line endings (LF), doesn't convert to CRLF
 */
function formatJSON(data, indentation, originalLineEnding) {
  const indentStr = indentation.char === 'tab' ? '\t' : ' '.repeat(indentation.indent);
  let json = JSON.stringify(data, null, indentStr);
  
  // FIXED: Preserve original line endings (don't convert to CRLF)
  // JSON.stringify uses LF by default, so we only need to convert if original was CRLF
  if (originalLineEnding === '\r\n') {
    json = json.replace(/\n/g, '\r\n');
  }
  
  return json;
}

/**
 * Validate JSON by attempting to parse it
 */
function validateJSON(content, filePath) {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Safety check: prevent modification of English locale files
 */
function checkEnglishLocaleProtection(filePath) {
  if (filePath.includes(`${path.sep}en${path.sep}`) || filePath.includes('/en/')) {
    throw new Error(`SAFETY CHECK FAILED: Attempted to modify English locale file at ${filePath}. English files must not be modified.`);
  }
}

/**
 * Process a single locale/namespace pair
 * FIXED: Non-mutating merge, accurate statistics
 */
async function processLocaleNamespace(locale, namespace, options) {
  const report = {
    locale,
    namespace,
    keysAdded: 0,
    errors: [],
    filePath: ''
  };

  try {
    // Load English baseline
    const englishPath = path.join(LOCALES_DIR, EN_LOCALE, `${namespace}.json`);
    if (!fs.existsSync(englishPath)) {
      report.errors.push(`English baseline file not found: ${englishPath}`);
      return report;
    }

    const englishContent = loadJSON(englishPath);
    const englishData = parseJSON(englishContent, englishPath);

    // Load target locale
    const targetPath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
    report.filePath = targetPath;

    if (!fs.existsSync(targetPath)) {
      report.errors.push(`Target locale file not found: ${targetPath}`);
      return report;
    }

    // Safety check
    checkEnglishLocaleProtection(targetPath);

    // Load existing target data
    const targetContent = loadJSON(targetPath);
    const lineEnding = detectLineEnding(targetContent);
    
    let targetData;
    try {
      targetData = parseJSON(targetContent, targetPath);
    } catch (error) {
      report.errors.push(`Failed to parse target file: ${error.message}`);
      return report;
    }

    // FIXED: Clone target to avoid mutation
    const targetDataClone = JSON.parse(JSON.stringify(targetData));

    // Detect indentation
    const indentation = detectIndentation(targetContent, englishContent);

    // Deep merge (non-mutating on original target)
    const mergeResult = deepMerge(targetDataClone, englishData);
    report.keysAdded = mergeResult.stats.added;
    report.errors.push(...mergeResult.stats.errors);

    // Format output with proper indentation and line endings
    const outputContent = formatJSON(mergeResult.merged, indentation, lineEnding);

    // Validate output
    const validation = validateJSON(outputContent, targetPath);
    if (!validation.valid) {
      report.errors.push(`Output JSON validation failed: ${validation.error}`);
      return report;
    }

    // Write or log
    if (options.dryRun) {
      if (options.verbose) {
        console.log(`[DRY-RUN] Would write to: ${targetPath}`);
        console.log(`[DRY-RUN] Keys added: ${report.keysAdded}`);
        if (report.errors.length > 0) {
          console.log(`[DRY-RUN] Warnings: ${report.errors.length}`);
          for (const error of report.errors) {
            console.log(`  - ${error}`);
          }
        }
      }
    } else {
      fs.writeFileSync(targetPath, outputContent, 'utf-8');
      if (options.verbose) {
        console.log(`✓ Wrote ${report.keysAdded} new keys to ${targetPath}`);
      }
    }

    return report;
  } catch (error) {
    report.errors.push(error.message);
    return report;
  }
}

/**
 * Generate summary report
 */
function generateReport(reports, options) {
  console.log('\n' + '='.repeat(80));
  console.log('BACKFILL REPORT');
  console.log('='.repeat(80));

  if (options.dryRun) {
    console.log('MODE: DRY-RUN (no files modified)\n');
  }

  let totalKeysAdded = 0;
  let totalFilesProcessed = 0;
  let totalWarnings = 0;
  let totalErrors = 0;

  for (const report of reports) {
    if (report.errors.length > 0) {
      console.log(`\n⚠️  ${report.locale}/${report.namespace}: ${report.keysAdded} keys added, ${report.errors.length} warning(s)`);
      for (const error of report.errors) {
        console.log(`   ${error}`);
      }
      totalWarnings += report.errors.length;
    } else if (report.keysAdded > 0) {
      console.log(`✓ ${report.locale}/${report.namespace}: ${report.keysAdded} keys added`);
      totalKeysAdded += report.keysAdded;
      totalFilesProcessed++;
    } else {
      console.log(`- ${report.locale}/${report.namespace}: No changes needed`);
      totalFilesProcessed++;
    }
  }

  console.log('\n' + '-'.repeat(80));
  console.log(`Summary:`);
  console.log(`  Files processed: ${totalFilesProcessed}`);
  console.log(`  Total keys added: ${totalKeysAdded}`);
  console.log(`  Warnings: ${totalWarnings}`);
  console.log('='.repeat(80) + '\n');

  // Verification check
  if (totalKeysAdded === 1445) {
    console.log('✓ VERIFICATION: Total keys added matches specification (1,445) ✅\n');
  } else if (totalKeysAdded !== 0) {
    console.log(`⚠️  VERIFICATION: Total keys added (${totalKeysAdded}) does not match specification (1,445)\n`);
  }
}

/**
 * Main entry point
 */
async function main() {
  const options = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
    locale: process.argv.includes('--locale') ? process.argv[process.argv.indexOf('--locale') + 1] : undefined,
    namespace: process.argv.includes('--namespace') ? process.argv[process.argv.indexOf('--namespace') + 1] : undefined,
  };

  console.log('🌍 Translation Backfill Script (FIXED VERSION)');
  console.log(`Locales directory: ${LOCALES_DIR}\n`);

  const reports = [];

  // Determine which locales and namespaces to process
  const localesToProcess = options.locale ? [options.locale] : TARGET_LOCALES;
  const namespacesToProcess = options.namespace ? [options.namespace] : NAMESPACES;

  // Process each locale/namespace pair
  for (const locale of localesToProcess) {
    for (const namespace of namespacesToProcess) {
      const report = await processLocaleNamespace(locale, namespace, options);
      reports.push(report);
    }
  }

  // Generate report
  generateReport(reports, options);

  // Exit with error code if there were failures
  const hasErrors = reports.some(r => r.errors.length > 0);
  process.exit(hasErrors ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
