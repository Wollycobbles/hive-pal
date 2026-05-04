import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates all locale JSON files for parsing correctness
 * Tests: 7 locales × 8 namespaces = 56 files expected
 */

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
const LOCALES = ['en', 'da', 'de', 'fr', 'it', 'sk', 'sr'];
const NAMESPACES = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];

interface ValidationResult {
  file: string;
  valid: boolean;
  error?: string;
  size: number;
}

async function validateAllLocales(): Promise<void> {
  const results: ValidationResult[] = [];
  const errors: ValidationResult[] = [];
  let totalFiles = 0;
  let validFiles = 0;

  console.log('🔍 Validating all locale JSON files...\n');

  for (const locale of LOCALES) {
    for (const namespace of NAMESPACES) {
      const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
      totalFiles++;

      try {
        if (!fs.existsSync(filePath)) {
          errors.push({
            file: filePath,
            valid: false,
            error: 'File not found',
            size: 0,
          });
          continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const stat = fs.statSync(filePath);
        
        // Attempt to parse JSON
        JSON.parse(content);
        
        validFiles++;
        results.push({
          file: `${locale}/${namespace}`,
          valid: true,
          size: stat.size,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          file: `${locale}/${namespace}`,
          valid: false,
          error: errorMessage,
          size: 0,
        });
      }
    }
  }

  console.log(`✅ VALIDATION SUMMARY`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total files expected: ${totalFiles}`);
  console.log(`Valid files: ${validFiles}`);
  console.log(`Invalid files: ${errors.length}`);
  console.log();

  if (errors.length > 0) {
    console.log('❌ INVALID FILES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const result of errors) {
      console.log(`  ❌ ${result.file}`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
    }
    process.exit(1);
  }

  console.log('✅ All 56 locale files parse correctly!');
  console.log();
}

validateAllLocales().catch(console.error);
