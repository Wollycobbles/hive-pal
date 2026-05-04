# Harvest Translation Implementation Checklist

## Phase 1: Foundation (✅ COMPLETE)

### Task 1: Analysis
- [x] Analyzed harvest-list-page.tsx (218 lines)
- [x] Analyzed harvest-detail-page.tsx (550 lines)
- [x] Analyzed harvest-wizard.tsx (213 lines)
- [x] Identified 85 unique hardcoded strings
- [x] Categorized strings by section (page, stats, table, details, weight, notes, hiveDistribution, wizard, actions, status, messages)

### Task 2: English Baseline
- [x] Created `apps/frontend/public/locales/en/harvest.json`
- [x] Organized into 11 logical sections
- [x] 85 total translation keys
- [x] Proper JSON formatting (2-space indent, LF endings)
- [x] Validated JSON structure

### Task 3: Multi-Locale Support
- [x] Created `apps/frontend/public/locales/da/harvest.json` (Danish)
- [x] Created `apps/frontend/public/locales/de/harvest.json` (German)
- [x] Created `apps/frontend/public/locales/fr/harvest.json` (French)
- [x] Created `apps/frontend/public/locales/it/harvest.json` (Italian)
- [x] Created `apps/frontend/public/locales/sk/harvest.json` (Slovak)
- [x] Created `apps/frontend/public/locales/sr/harvest.json` (Serbian)
- [x] All files use English placeholders (per project backfill convention)
- [x] All files validated as proper JSON

### Task 4: Documentation
- [x] Created HARVEST_NAMESPACE_REPORT.md (433 lines)
  - Executive summary
  - Detailed string analysis
  - Namespace structure
  - File statistics
  - Next steps
  - Translation guidelines

- [x] Created HARVEST_KEYS_REFERENCE.md (247 lines)
  - Quick reference tables
  - String-to-key mappings
  - Code usage examples
  - Namespace statistics
  - Validation checklist

- [x] Created HARVEST_SUMMARY.md (comprehensive summary)
- [x] Created HARVEST_IMPLEMENTATION_CHECKLIST.md (this file)

---

## Phase 2: Code Integration (⏳ PENDING)

### harvest-list-page.tsx (12 strings)
- [ ] Import `useTranslation` from 'react-i18next'
- [ ] Replace "Loading harvests..." (line 56)
- [ ] Replace "Harvests" page title (line 64)
- [ ] Replace page description (line 66)
- [ ] Replace "Total Harvests" (line 77)
- [ ] Replace "{{count}} completed" (line 84)
- [ ] Replace "Total Honey" (line 91)
- [ ] Replace "From completed harvests" (line 99)
- [ ] Replace "Average Yield" (line 106)
- [ ] Replace "Per harvest" (line 113)
- [ ] Replace "Latest Harvest" (line 120)
- [ ] Replace "None" (line 128) - **REVIEW NEEDED**
- [ ] Replace "No data" (line 133)
- [ ] Replace "Harvest History" (line 142)
- [ ] Replace "No harvests yet" (line 148)
- [ ] Replace empty state description (line 150)
- [ ] Replace table headers (lines 158-163)
- [ ] Replace "View" button (line 202)
- [ ] Test with `npm run dev` in English
- [ ] Test with Danish locale

### harvest-detail-page.tsx (35+ strings)
- [ ] Import `useTranslation` from 'react-i18next'
- [ ] Replace all loading messages
- [ ] Replace all success toast messages (weight, notes, finalization, etc.)
- [ ] Replace all error toast messages
- [ ] Replace all button labels
- [ ] Replace all field labels (Date, Total Hives, Total Frames, Total Weight, Notes)
- [ ] Replace all status alert messages (Draft, In Progress, Completed)
- [ ] Replace all dialog/confirmation messages
- [ ] Replace page title and badge
- [ ] Test with `npm run dev` in English
- [ ] Test with Danish locale
- [ ] Test toast notifications appear correctly

### harvest-wizard.tsx (11 strings)
- [ ] Import `useTranslation` from 'react-i18next'
- [ ] Replace dialog trigger button (line 98)
- [ ] Replace dialog title (line 103)
- [ ] Replace all form labels (date, hives, notes)
- [ ] Replace all placeholders
- [ ] Replace error validation message (line 65)
- [ ] Replace success message (line 84)
- [ ] Replace start/starting button text
- [ ] Replace cancel button
- [ ] Test with `npm run dev` in English
- [ ] Test with Danish locale
- [ ] Test form validation messages

### General Code Updates
- [ ] Verify no hardcoded strings remain in harvest components
- [ ] Check console for i18next warnings about missing keys
- [ ] Ensure all `{{variable}}` interpolations are passed correctly
- [ ] Verify table headers accept dynamic {{unit}} parameter
- [ ] Test with different unit systems (metric/imperial)

---

## Phase 3: Professional Translation (⏳ PENDING)

### Prepare Translation Package
- [ ] Extract harvest.json for all 6 non-English locales
- [ ] Create translation brief with beekeeping context
- [ ] Include terminology glossary:
  - [ ] "frames" = beekeeping frames/combs
  - [ ] "hives" = individual bee colonies
  - [ ] "apiary" = bee yard/apiary location
  - [ ] "harvest" = honey collection event
  - [ ] "distribution" = dividing honey among contributing hives

### Translation Management
- [ ] Send to professional translators (or translation service)
- [ ] Ensure translators have beekeeping domain knowledge
- [ ] Set deadline for translations
- [ ] Request review from subject matter expert for each locale
- [ ] Collect translated harvest.json files

### Update Locale Files
- [ ] Replace Danish harvest.json with translations
- [ ] Replace German harvest.json with translations
- [ ] Replace French harvest.json with translations
- [ ] Replace Italian harvest.json with translations
- [ ] Replace Slovak harvest.json with translations
- [ ] Replace Serbian harvest.json with translations
- [ ] Validate all 6 files as proper JSON after updates

---

## Phase 4: QA & Testing (⏳ PENDING)

### Functional Testing
- [ ] Load app with English locale
  - [ ] All harvest page strings display correctly
  - [ ] Statistics cards show proper values
  - [ ] Table renders with translated headers
  - [ ] Buttons and actions work correctly
  - [ ] Toast notifications appear in English

- [ ] Load app with Danish locale
  - [ ] All strings appear in Danish
  - [ ] No console warnings about missing keys
  - [ ] UI layout accommodates Danish text length
  - [ ] Buttons and forms remain functional

- [ ] Load app with German locale
  - [ ] All strings appear in German
  - [ ] No console warnings about missing keys
  - [ ] UI layout accommodates German text length (often longer)
  - [ ] Special characters (ä, ö, ü) display correctly

- [ ] Load app with French locale
  - [ ] All strings appear in French
  - [ ] No console warnings about missing keys
  - [ ] Verify French character diacritics display correctly
  - [ ] Buttons remain properly sized

- [ ] Load app with Italian locale
  - [ ] All strings appear in Italian
  - [ ] No console warnings about missing keys
  - [ ] Special characters display correctly
  - [ ] UI spacing is appropriate

- [ ] Load app with Slovak locale
  - [ ] All strings appear in Slovak
  - [ ] No console warnings about missing keys
  - [ ] Special characters (č, š, ž, etc.) display correctly
  - [ ] Date format follows Slovak conventions

- [ ] Load app with Serbian locale
  - [ ] All strings appear in Serbian
  - [ ] No console warnings about missing keys
  - [ ] Cyrillic characters display correctly
  - [ ] All UI elements render properly

### Locale-Specific Testing
- [ ] Date formatting respects locale settings
- [ ] Weight unit display (kg vs lbs) respects user preferences
- [ ] Number formatting follows locale conventions
- [ ] Toast notifications respect RTL/LTR layout if applicable
- [ ] Modal/dialog sizing accommodates translated text

### UI/UX Testing
- [ ] No text truncation in statistics cards
- [ ] No text truncation in table headers
- [ ] No text truncation in button labels
- [ ] Form labels don't overlap with input fields
- [ ] Modal content doesn't overflow container
- [ ] Long translated strings don't break layout

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile view (responsive design)

### Error Handling
- [ ] Error messages display correctly in all locales
- [ ] Validation messages are clear in all locales
- [ ] Empty state messages are appropriate for all locales
- [ ] Loading states show correct text in all locales

### Accessibility Testing
- [ ] Screen readers announce translated text correctly
- [ ] Keyboard navigation works with translated
