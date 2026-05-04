# Harvest.json Translation Keys - Quick Reference

## Key Mapping for Code Updates

### harvest-list-page.tsx Translation Keys

| Line | Current Hardcode | New Translation Key |
|------|------------------|-------------------|
| 56 | `"Loading harvests..."` | `harvest:messages.loading` |
| 64 | `"Harvests"` | `harvest:page.title` |
| 66 | `"Manage your honey harvests and track production"` | `harvest:page.description` |
| 77 | `"Total Harvests"` | `harvest:stats.totalHarvests` |
| 84 | `"{{count}} completed"` | `harvest:stats.completedHarvests` |
| 91 | `"Total Honey"` | `harvest:stats.totalHoney` |
| 99 | `"From completed harvests"` | `harvest:stats.fromCompletedHarvests` |
| 106 | `"Average Yield"` | `harvest:stats.averageYield` |
| 113 | `"Per harvest"` | `harvest:stats.perHarvest` |
| 120 | `"Latest Harvest"` | `harvest:stats.latestHarvest` |
| 128 | `"None"` | **REVIEW NEEDED** |
| 133 | `"No data"` | `harvest:stats.noData` |
| 142 | `"Harvest History"` | `harvest:table.title` |
| 148 | `"No harvests yet"` | `harvest:table.empty.title` |
| 150 | `"Start tracking your honey harvests..."` | `harvest:table.empty.description` |
| 158-163 | Table header strings | `harvest:table.headers.*` |
| 202 | `"View"` | `harvest:actions.view` or `common:actions.view` |

---

### harvest-detail-page.tsx Translation Keys

| Line | Current Hardcode | New Translation Key |
|------|------------------|-------------------|
| 76 | `"Loading..."` | `harvest:messages.loadingDetails` |
| 80 | `"Harvest not found"` | `harvest:messages.notFound` |
| 91 | `"Please enter a valid weight"` | `harvest:weight.error` |
| 103 | `"Weight set successfully"` | `harvest:messages.weightSetSuccess` |
| 107 | `"Failed to set weight"` | `harvest:messages.weightSetError` |
| 117 | `"Notes updated"` | `harvest:messages.notesUpdateSuccess` |
| 120 | `"Failed to update notes"` | `harvest:messages.notesUpdateError` |
| 127 | `"Harvest finalized successfully"` | `harvest:messages.finalizationSuccess` |
| 132 | `"Failed to finalize harvest"` | `harvest:messages.finalizationError` |
| 152 | `"Harvest reopened for editing"` | `harvest:messages.reopenSuccess` |
| 154 | `"Failed to reopen harvest"` | `harvest:messages.reopenError` |
| 161 | `"Harvest deleted"` | `harvest:messages.deleteSuccess` |
| 164 | `"Failed to delete harvest"` | `harvest:messages.deleteError` |
| 178 | `"Hives updated and distribution recalculated"` | `harvest:messages.hivesUpdateSuccess` |
| 181 | `"Failed to update hives"` | `harvest:messages.hivesUpdateError` |
| 145 | `"Failed to create share link"` | `harvest:messages.shareError` |
| 197 | `"Harvest Details"` | `harvest:details.title` |
| 210 | `"Share"` | `harvest:actions.share` |
| 216 | `"Reopen"` | `harvest:actions.reopen` |
| 226 | `"Finalize"` | `harvest:actions.finalize` |
| 237 | `"Delete Harvest?"` | `harvest:actions.deleteConfirmTitle` |
| 239-240 | `"This action cannot be undone..."` | `harvest:actions.deleteConfirmDescription` |
| 247 | `"This harvest has been finalized..."` | `harvest:status.completedDescription` |
| 255/258 | `"Cancel"` / `"Delete"` | `common:actions.cancel` / `common:actions.delete` |
| 269 | `"Harvest Information"` | `harvest:details.information` |
| 274 | `"Date"` | `harvest:details.fields.date` |
| 280 | `"Total Hives"` | `harvest:details.fields.totalHives` |
| 284 | `"Total Frames"` | `harvest:details.fields.totalFrames` |
| 288 | `"Total Weight"` | `harvest:details.fields.totalWeight` |
| 314 | `"Set Weight"` | `harvest:weight.setWeight` |
| 333 | `"Save"` | `harvest:weight.button` or `common:actions.save` |
| 343 | `"Cancel"` | `common:actions.cancel` |
| 359 | `"Notes"` | `harvest:details.fields.notes` |
| 370 | `"Edit"` | `common:actions.edit` |
| 383 | `"Save"` | `common:actions.save` |
| 390 | `"Cancel"` | `common:actions.cancel` |
| 395 | `"No notes"` | `harvest:details.fields.noNotes` |
| 404 | `"Hive Distribution"` | `harvest:hiveDistribution.title` |
| 420 | `"Edit"` | `common:actions.edit` |
| 455 | `"frames"` | `harvest:hiveDistribution.frames` |
| 467 | `"Cancel"` | `common:actions.cancel` |
| 474 | `"Save & Recalculate"` | `harvest:hiveDistribution.saveButton` |
| 512 | `"Draft Harvest"` | `harvest:status.draft` |
| 514 | `"This harvest is in draft status..."` | `harvest:status.draftDescription` |
| 523 | `"Ready to Finalize"` | `harvest:status.inProgress` |
| 524 | `"Weight has been set..."` | `harvest:status.inProgressDescription` |

---

### harvest-wizard.tsx Translation Keys

| Line | Current Hardcode | New Translation Key |
|------|------------------|-------------------|
| 65 | `"Please select at least one hive"` | `harvest:wizard.error` |
| 84 | `"Harvest started successfully"` | `harvest:wizard.successMessage` |
| 88 | `"Failed to start harvest"` | `common:messages.errorOccurred` or new key |
| 98 | `"Start Harvest"` | `harvest:wizard.triggerButton` |
| 103 | `"Start New Harvest"` | `harvest:wizard.title` |
| 108 | `"Harvest Date"` | `harvest:wizard.dateLabel` |
| 119 | `"Pick a date"` | `harvest:wizard.datePickerPlaceholder` |
| 135 | `"Select Hives and Frame Counts"` | `harvest:wizard.hivesLabel` |
| 167 | `"frames"` | `harvest:hiveDistribution.frames` |
| 175 | `"Selected: ... hive(s) • ... total frames"` | `harvest:wizard.frameSummary` |
| 183 | `"Notes (Optional)"` | `harvest:wizard.notesLabel` |
| 188 | `"Add any notes about this harvest..."` | `harvest:wizard.notesPlaceholder` |
| 200 | `"Cancel"` | `common:actions.cancel` |
| 206 | `"Start Harvest"` / `"Starting..."` | `harvest:wizard.startButton` / `harvest:wizard.startingButton` |

---

## Usage Examples

### Basic Translation
```tsx
import { useTranslation } from 'react-i18next';

export const HarvestListPage = () => {
  const { t } = useTranslation();

  return (
    <h1 className="text-3xl font-bold">{t('harvest:page.title')}</h1>
  );
};
```

### With Interpolation
```tsx
const { t } = useTranslation();

// For count interpolation
<p>{t('harvest:stats.completedHarvests', { count: 5 })}</p>

// For unit interpolation
<TableHead>{t('harvest:table.headers.honey', { unit: getWeightUnit() })}</TableHead>

// For multiple interpolations
<p>{t('harvest:wizard.frameSummary', { 
  selectedCount: selectedHives.size,
  totalFrames: totalFrames
})}</p>
```

### Toast Messages
```tsx
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

const handleSetWeight = async () => {
  try {
    await setHarvestWeight.mutateAsync({...});
    toast.success(t('harvest:messages.weightSetSuccess'));
  } catch {
    toast.error(t('harvest:messages.weightSetError'));
  }
};
```

### Common Action Buttons (Reuse from common namespace)
```tsx
// Instead of creating duplicate keys, use existing common namespace
<Button>{t('common:actions.save')}</Button>
<Button>{t('common:actions.cancel')}</Button>
<Button>{t('common:actions.delete')}</Button>
<Button>{t('common:actions.edit')}</Button>
```

---

## Namespace Statistics

| Section | Key Count |
|---------|-----------|
| page | 2 |
| stats | 8 |
| table | 11 |
| details | 8 |
| weight | 6 |
| notes | 1 |
| hiveDistribution | 7 |
| wizard | 11 |
| actions | 7 |
| status | 6 |
| messages | 16 |
| **TOTAL** | **85** |

---

## File Locations

```
apps/frontend/public/locales/
├── en/harvest.json
├── da/harvest.json
├── de/harvest.json
├── fr/harvest.json
├── it/harvest.json
├── sk/harvest.json
└── sr/harvest.json
```

---

## Validation Checklist

Before marking harvest page updates as complete:

- [ ] All hardcoded strings replaced with translation keys
- [ ] `useTranslation` hook imported in each component
- [ ] Interpolation parameters properly passed for dynamic content
- [ ] Common namespace keys reused where appropriate
- [ ] No `harvest:` keys used in common namespace
- [ ] All components tested with English locale
- [ ] Tested with at least one non-English locale to verify i18n is working
- [ ] No console warnings about missing translation keys
- [ ] Date formatting preserves locale-specific formats
- [ ] Unit display (kg vs lbs) respects user preferences
- [ ] UI spacing accommodates longer translated strings
- [ ] Toast/notification messages display correctly in all locales

---

## Notes

1. **"None" String (Line 128, harvest-list-page.tsx)**: 
   - Currently used when no harvests exist for "Latest Harvest" stat
   - Consider if this should be a harvest-specific key or reused from common translations
   - May need context-specific wording

2. **"Failed to start harvest" (Line 88, harvest-wizard.tsx)**:
   - Could reuse `common:messages.errorOccurred` or create specific key
   - Current key not in harvest.json - verify usage

3. **"Harvest finalized!" (SharePromptDialog title)**:
   - Not currently in harvest.json but appears in code
   - May need additional key or special handling

4. **Button Labels Consistency**:
   - Some buttons use "Save", "Cancel", "Delete" which exist in `common:actions`
   - Decide on a per-component basis whether to use common or harvest-specific keys
   - Recommendation: Use `common:actions` for generic buttons, `harvest:*` only for harvest-specific text

---

## Translation Quality Notes for Translators

When translating these strings, keep in mind:

1. **"frames"** - Beekeeping context: honey bee frames/combs, not data frames
2. **"hives"** - Individual bee colonies in an apiary
3. **"Hive Distribution"** - Dividing total harvested honey among the contributing hives
4. **"Honey ({{unit}})"** - Unit will be either kg or lbs based on user preference
5. **Measurement consistency** - Align with other beekeeping terminology in the app
6. **Button space constraints** - Some buttons have limited UI space
