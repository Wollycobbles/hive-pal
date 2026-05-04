# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Testing

This project uses two complementary testing frameworks:

### Vitest (Unit Tests)

Vitest is used for unit testing pure logic, utilities, hooks, and stores. Test files follow the pattern `**/*.{test,spec}.{ts,tsx}`.

**When to use Vitest:**
- Pure functions and utility modules
- Custom React hooks (without complex DOM interactions)
- State management stores (Zustand stores)
- Business logic and data transformations
- Type utilities and helper functions

**Running Vitest:**
```bash
pnpm test           # Run tests once
pnpm test:watch     # Watch mode for development
```

**Configuration:** `vitest.config.ts`
- Explicit imports required (`import { describe, it, expect } from 'vitest'`)
- JSDOM environment for DOM-dependent tests
- Inherits path aliases from Vite config

### Playwright Component Testing

Playwright Component Testing is used for testing React components with full DOM rendering and user interactions. Test files follow the pattern `**/*.ct.{ts,tsx}`.

**When to use Playwright CT:**
- React components requiring DOM rendering
- User interaction flows (clicks, form inputs, etc.)
- Visual regression testing
- Components with complex lifecycle behavior
- Integration tests between multiple components

**Running Playwright CT:**
```bash
pnpm test:ct        # Run component tests
```

### Testing Strategy

Choose the appropriate framework based on what you are testing:

- **Vitest**: Fast, lightweight tests for isolated logic
- **Playwright CT**: Comprehensive component tests with real browser behavior

Both frameworks coexist and complement each other to provide complete test coverage.

## Internationalization (i18n)

This project uses **i18next** for internationalization with translation files stored as JSON in `public/locales/{locale}/{namespace}.json`.

### Supported Locales

- **en** (English) - Baseline/source locale with complete translations
- **da** (Danish)
- **de** (German)
- **fr** (French)
- **it** (Italian)
- **sk** (Slovak)
- **sr** (Serbian)

### Namespaces

Translations are organized into 8 namespaces:
- `admin` - Administrative interface
- `apiary` - Apiary management
- `auth` - Authentication flows
- `common` - Common UI elements and navigation
- `hive` - Hive-specific terminology and labels
- `inspection` - Inspection form fields and descriptions
- `onboarding` - Onboarding flow
- `queen` - Queen bee tracking

### English Placeholders

**Important:** Non-English locales may contain English text placeholders where community translations are not yet available. These English strings indicate areas that need translation work. They are provided as temporary fallbacks to ensure the UI remains functional while waiting for translated content.

**Current State (as of latest backfill):**
- Italian: 564 keys with English placeholders (46% of total)
- Serbian: 382 keys with English placeholders (31%)
- Slovak: 190 keys with English placeholders (15%)
- German: 149 keys with English placeholders (12%)
- Danish: 128 keys with English placeholders (10%)
- French: 32 keys with English placeholders (3%)

### Contributing Translations

To help translate Hive Pal into your language:

1. **Identify untranslated keys:** Look for English text in non-English locales (see current state above)
2. **Edit the JSON file:** Update `public/locales/{locale}/{namespace}.json` with proper translations
3. **Preserve structure:** Maintain the JSON structure and key hierarchy - only change the string values
4. **Test locally:** Run `pnpm dev` and switch to your locale to verify translations display correctly
5. **Submit PR:** Create a pull request with your translation updates

**Translation Guidelines:**
- Keep translations concise and aligned with existing terminology
- Preserve any formatting (e.g., {variable} placeholders for dynamic content)
- Test with the UI - some labels have character length constraints
- Review existing translations in the same locale for consistency

### Managing Translations

The backfill script (`scripts/backfill-translations.js`) can be used to:
- Add English placeholders for all missing keys in target locales
- Preserve existing translations while adding new ones
- Validate JSON structure and formatting

**To run the backfill script:**
```bash
# Dry-run (shows changes without modifying files)
node scripts/backfill-translations.js --dry-run

# Execute backfill on all locales
node scripts/backfill-translations.js

# Execute backfill for specific locale
node scripts/backfill-translations.js --locale it
```

