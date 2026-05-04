const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../apps/frontend/public/locales');
const LOCALES = ['en', 'da', 'de', 'fr', 'it', 'sk', 'sr'];
const NAMESPACES = ['admin', 'apiary', 'auth', 'common', 'hive', 'inspection', 'onboarding', 'queen'];

function validateAllLocales() {
  const results = [];
  const errors = [];
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
            error: 'File not found'
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
          size: stat.size
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          file: `${locale}/${namespace}`,
          valid: false,
          error: errorMessage
        });
      }
    }
  }

  console.log(`✅ VALIDATION SUMMARY`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total locales: ${LOCALES.length}`);
  console.log(`Total namespaces: ${NAMESPACES.length}`);
  console.log(`Total files expected: ${totalFiles} (${LOCALES.length} locales × ${NAMESPACES.length} namespaces)`);
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

  console.log(`✅ All ${totalFiles} locale files parse correctly!`);
  console.log();
}

validateAllLocales();
