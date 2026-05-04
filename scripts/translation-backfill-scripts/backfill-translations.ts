#!/usr/bin/env node

/**
 * Translation Backfill Script
 * 
 * Fills missing translation keys in target locale files (da, de, fr, it, sk, sr)
 * with English placeholder values from the baseline locale (en).
 * 
 * Features:
 * - Deep merge algorithm preserving existing translations
 * - Safety checks preventing English locale modification
 * - Dry-run mode for testing
 * - Comprehensive reporting
 * - Indentation and formatting preservation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
const EN_LOCALE = 'en';
const TARGET_LOCALES = ['da', 'de', 'fr', 'it', 'sk', 'sr'];
const NAMESPACES = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];

interface BackfillOptions {
  dryRun: boolean;
  verbose: boolean;
  locale?: string;
  namespace?: string;
}

interface BackfillReport {
  locale: string;
  namespace: string;
  keysAdded: number;
  keysNotModified: number;
  errors: string[];
  filePath: string;
}

interface IndentationInfo {
  indent: number;
  char: string; // 'space' or 'tab'
}

/**
 * Detect indentation style from a JSON file
 */
function detectIndentation(content: string): IndentationInfo {
  // Find the first indented line
  const match = content.match(/\n(\s+)[\{\"]/);
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
 * Load and parse JSON file
 */
function loadJSON(filePath: string): Record<string, any> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Deep merge algorithm: recursively traverse source keys, add to target if missing or empty
 */
function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>,
  sourceKey: string = ''
): { merged: Record<string, any>; stats: { added: number; errors: string[] } } {
  const stats = { added: 0, errors: [] };

  for (const key in source) {
    const sourceValue = source[key];
    const sourceKeyPath = sourceKey ? `${sourceKey}.${key}` : key;

    if (!(key in target)) {
      // Key missing in target - add it
      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
        // For objects, recursively merge
        target[key] = {};
        const result = deepMerge(target[key], sourceValue, sourceKeyPath);
        stats.added += result.stats.added;
        stats.errors.push(...result.stats.errors);
      } else {
        // For simple values, copy from source
        target[key] = sourceValue;
        stats.added++;
      }
    } else if (target[key] === '' && sourceValue !== '') {
      // Key exists but is empty - replace with source value
      if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
        stats.errors.push(`Type mismatch at ${sourceKeyPath}: target is string but source is object`);
      } else {
        target[key] = sourceValue;
        stats.added++;
      }
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
    }
    // else: target has non-empty value - preserve it
  }

  return { merged: target, stats };
}

/**
 * Format JSON with proper indentation and line endings
 */
function formatJSON(data: Record<string, any>, indentation: IndentationInfo): string {
  const indentStr = indentation.char === 'tab' ? '\t' : ' '.repeat(indentation.indent);
  let json = JSON.stringify(data, null, indentStr);
  
  // Convert to CRLF line endings (Windows standard)
  json = json.replace(/\n/g, '\r\n');
  
  return json;
}

/**
 * Validate JSON by attempting to parse it
 */
function validateJSON(content: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

/**
 * Safety check: prevent modification of English locale files
 */
function checkEnglishLocaleProtection(filePath: string): void {
  if (filePath.includes(`${path.sep}en${path.sep}`) || filePath.includes('/en/')) {
    throw new Error(`SAFETY CHECK FAILED: Attempted to modify English locale file at ${filePath}. English files must not be modified.`);
  }
}

/**
 * Process a single locale/namespace pair
 */
async function processLocaleNamespace(
  locale: string,
  namespace: string,
  options: BackfillOptions
): Promise<BackfillReport> {
  const report: BackfillReport = {
    locale,
    namespace,
    keysAdded: 0,
    keysNotModified: 0,
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

    const englishData = loadJSON(englishPath);
    const englishContent = fs.readFileSync(englishPath, 'utf-8');
    const indentation = detectIndentation(englishContent);

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
    let targetData: Record<string, any>;
    try {
      targetData = loadJSON(targetPath);
    } catch (error) {
      report.errors.push(`Failed to parse target file: ${(error as Error).message}`);
      return report;
    }

    // Deep merge
    const mergeResult = deepMerge(targetData, englishData);
    report.keysAdded = mergeResult.stats.added;
    report.keysNotModified = Object.keys(englishData).length - mergeResult.stats.added;
    report.errors.push(...mergeResult.stats.errors);

    // Format output
    const outputContent = formatJSON(mergeResult.merged, indentation);

    // Validate output
    const validation = validateJSON(outputContent);
    if (!validation.valid) {
      report.errors.push(`Output JSON validation failed: ${validation.error}`);
      return report;
    }

    // Write or log
    if (options.dryRun) {
      if (options.verbose) {
        console.log(`[DRY-RUN] Would write to: ${targetPath}`);
        console.log(`[DRY-RUN] Keys added: ${report.keysAdded}`);
      }
    } else {
      fs.writeFileSync(targetPath, outputContent, 'utf-8');
      if (options.verbose) {
        console.log(`✓ Wrote ${report.keysAdded} new keys to ${targetPath}`);
      }
    }

    return report;
  } catch (error) {
    report.errors.push((error as Error).message);
    return report;
  }
}

/**
 * Generate summary report
 */
function generateReport(reports: BackfillReport[], options: BackfillOptions): void {
  console.log('\n' + '='.repeat(80));
  console.log('BACKFILL REPORT');
  console.log('='.repeat(80));

  if (options.dryRun) {
    console.log('MODE: DRY-RUN (no files modified)\n');
  }

  let totalKeysAdded = 0;
  let totalFilesProcessed = 0;
  let totalErrors = 0;

  for (const report of reports) {
    if (report.errors.length > 0) {
      console.log(`\n❌ ${report.locale}/${report.namespace}`);
      for (const error of report.errors) {
        console.log(`   Error: ${error}`);
      }
      totalErrors++;
    } else if (report.keysAdded > 0) {
      console.log(`\n✓ ${report.locale}/${report.namespace}: ${report.keysAdded} keys added`);
      totalKeysAdded += report.keysAdded;
      totalFilesProcessed++;
    } else {
      console.log(`\n- ${report.locale}/${report.namespace}: No changes needed`);
      totalFilesProcessed++;
    }
  }

  console.log('\n' + '-'.repeat(80));
  console.log(`Summary:`);
  console.log(`  Files processed: ${totalFilesProcessed}`);
  console.log(`  Total keys added: ${totalKeysAdded}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const options: BackfillOptions = {
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
    locale: process.argv.includes('--locale') ? process.argv[process.argv.indexOf('--locale') + 1] : undefined,
    namespace: process.argv.includes('--namespace') ? process.argv[process.argv.indexOf('--namespace') + 1] : undefined,
  };

  console.log('🌍 Translation Backfill Script');
  console.log(`Locales directory: ${LOCALES_DIR}\n`);

  const reports: BackfillReport[] = [];

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
