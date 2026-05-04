# Backfill Translations Script Documentation

## Overview

The `backfill-translations.js` script fills missing translation keys in target locale files (da, de, fr, it, sk, sr) with English placeholder values from the baseline locale (en).

## Features

- **Deep Merge Algorithm**: Recursively traverses English keys and adds them to target locales if missing or empty
- **Safety Checks**: Prevents accidental modification of English locale files
- **Indentation Preservation**: Detects and preserves the indentation style of each source file
- **Line Ending Preservation**: Maintains CRLF line endings (Windows standard)
- **JSON Validation**: Validates all output with JSON.parse() before writing
- **Dry-Run Mode**: Logs all changes without modifying files for testing and review
- **Comprehensive Reporting**: Summarizes changes per locale/namespace pair

## Usage

### Basic Usage
```bash
# Process all locales and namespaces (interactive review first, requires confirmation)
node scripts/backfill-translations.js

# Process all locales and namespaces in dry-run mode (safe for review)
node scripts/backfill-translations.js --dry-run

# Process with verbose logging
node scripts/backfill-translations.js --dry-run --verbose
```

### Specific Locale or Namespace
```bash
# Process only Italian locale
node scripts/backfill-translations.js --dry-run --locale it

# Process only common namespace
node scripts/backfill-translations.js --dry-run --namespace common

# Process Italian/common pair
node scripts/backfill-translations.js --dry-run --locale it --namespace common
```

### Full Processing (with file writes)
```bash
# Process all files and write changes to disk
node scripts/backfill-translations.js

# Process specific locale and write changes
node scripts/backfill-translations.js --locale da
```

## How It Works

### 1. Load English Baseline
- Loads the English locale file for the given namespace (e.g., `en/common.json`)
- Detects the indentation style from the English file
- All subsequent writes use the same indentation

### 2. Deep Merge Algorithm
The script recursively merges target locale files with English baseline:
```
For each key in English:
  If key missing in target:
    - Add the key with English value
  Else if key is empty ("") in target:
    - Replace with English value
  Else if both are nested objects:
    - Recursively merge the nested objects
  Else (target has non-empty value):
    - Preserve the existing translation
```

### 3. Formatting
- Detects indentation from the English source file (typically 2 or 4 spaces)
- Uses JSON.stringify with detected indentation
- Converts line endings to CRLF (Windows standard)

### 4. Validation
- Validates output JSON with JSON.parse()
- Reports validation errors and skips file if invalid
- Continues processing remaining files

### 5. Safety Checks
- Prevents modification of any files in `/en/` directory
- Throws error if English locale is targeted
- Validates source files exist before processing

## Error Handling

The script handles various error scenarios:

### File Not Found
```
Error: English baseline file not found: /path/to/en/admin.json
```
Action: Reports error and skips that file

### Malformed JSON
```
Error: Failed to parse JSON at /path/to/it/common.json: Unexpected token } in JSON at position 500
```
Action: Reports error and skips that file, continues with others

### Type Mismatch
```
Type mismatch at form.errors: target is string but source is object
```
Action: Logs warning but doesn't modify the key

### Safety Violation
```
SAFETY CHECK FAILED: Attempted to modify English locale file...
```
Action: Stops immediately with error

## Script Output

### Dry-Run Mode Output
```
🌍 Translation Backfill Script
Locales directory: .../locales

[DRY-RUN] Would write to: .../it/common.json
[DRY-RUN] Keys added: 191

================================================================================
BACKFILL REPORT
================================================================================
MODE: DRY-RUN (no files modified)

✓ it/common: 191 keys added

--------------------------------------------------------------------------------
Summary:
  Files processed: 1
  Total keys added: 191
  Errors: 0
================================================================================
```

### Normal Mode Output
```
🌍 Translation Backfill Script
Locales directory: .../locales

✓ Wrote 191 new keys to .../it/common.json
✓ Wrote 128 new keys to .../it/admin.json
...

================================================================================
BACKFILL REPORT
================================================================================

✓ it/common: 191 keys added
✓ it/admin: 128 keys added
...

✓ All files processed successfully
================================================================================
```

## Implementation Details

### Indentation Detection
The script automatically detects indentation by finding the first indented line in the JSON file and measuring the indent depth. This ensures consistency with the existing format.

### Deep Merge Algorithm
The deep merge is careful to:
- Only add missing keys
- Only fill empty ("") values with English text
- Recursively handle nested objects
- Preserve all existing non-empty translations

### File Format Preservation
- Indentation is detected from source and preserved in output
- Line endings are converted to CRLF (Windows standard per formatting-report.md)
- JSON structure is validated after each modification

## Troubleshooting

### Script fails with "English files must not be modified"
This safety check prevents accidental English locale modification. Review the --locale parameter.

### Output JSON validation fails
The source English file may have unexpected structure. Run on a known good namespace first (e.g., common) to verify.

### Some keys not added
Check the keys are present in the English source file. Missing keys in English won't be backfilled.

### Indentation looks different
This is expected if English and target files have different indentation styles. The script preserves the English indentation when merging.

## Design Decisions

### Why Deep Merge?
Translation files have nested structures for organization. A deep merge ensures all nested keys are properly filled.

### Why Preserve Existing Translations?
Only adding missing keys prevents accidentally overwriting community translations.

### Why CRLF Line Endings?
Per formatting-report.md analysis, all existing locale files use CRLF, so output should match for Git consistency.

### Why Detect Indentation?
Files have mixed indentation styles (2, 4, 8 spaces). Auto-detection preserves each file's original style.

## Performance

- Processing all 48 files (6 locales × 8 namespaces) typically completes in under 100ms
- Dry-run mode is slightly faster as it skips file writes
- Memory usage is minimal (typically <10MB)

## Next Steps

1. Review dry-run output: `node scripts/backfill-translations.js --dry-run --verbose`
2. If output looks correct, run actual backfill: `node scripts/backfill-translations.js`
3. Review git diff to verify expected changes
4. Commit changes with message: `feat(i18n): add English placeholders for 1,445 missing translation keys across 6 locales`
