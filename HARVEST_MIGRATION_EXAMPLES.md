# Harvest Translation Migration - Code Examples

## Overview
This document shows before/after examples of the hardcoded English strings that were replaced with i18next translation keys.

---

## 1. harvest-list-page.tsx

### Example 1: Page Title
**Before:**
```jsx
<h1>Harvests</h1>
```

**After:**
```jsx
<h1>{t('page.title')}</h1>
```

---

### Example 2: Dynamic Stats with Interpolation
**Before:**
```jsx
<div>
  <span>{completedCount} completed</span>
  <span>From completed harvests</span>
  <span>Per harvest</span>
</div>
```

**After:**
```jsx
<div>
  <span>{t('stats.completedHarvests', { count: completedCount })}</span>
  <span>{t('stats.fromCompletedHarvests')}</span>
  <span>{t('stats.perHarvest')}</span>
</div>
```

**Translation Key (harvest.json):**
```json
"stats": {
  "completedHarvests": "{{count}} completed"
}
```

---

### Example 3: Table Headers with Unit Interpolation
**Before:**
```jsx
<TableHead>Date</TableHead>
<TableHead>Status</TableHead>
<TableHead>Hives</TableHead>
<TableHead>Frames</TableHead>
<TableHead>Honey (kg)</TableHead>
<TableHead>Actions</TableHead>
```

**After:**
```jsx
<TableHead>{t('table.headers.date')}</TableHead>
<TableHead>{t('table.headers.status')}</TableHead>
<TableHead>{t('table.headers.hives')}</TableHead>
<TableHead>{t('table.headers.frames')}</TableHead>
<TableHead>{t('table.headers.honey', { unit: weightUnit })}</TableHead>
<TableHead>{t('table.headers.actions')}</TableHead>
```

**Translation Key (harvest.json):**
```json
"table": {
  "headers": {
    "honey": "Honey ({{unit}})"
  }
}
```

---

## 2. harvest-detail-page.tsx

### Example 1: Form Labels
**Before:**
```jsx
<Label>Date</Label>
<Label>Total Hives</Label>
<Label>Total Frames</Label>
<Label>Total Weight</Label>
<Label>Notes</Label>
```

**After:**
```jsx
<Label>{t('details.fields.date')}</Label>
<Label>{t('details.fields.totalHives')}</Label>
<Label>{t('details.fields.totalFrames')}</Label>
<Label>{t('details.fields.totalWeight')}</Label>
<Label>{t('details.fields.notes')}</Label>
```

---

### Example 2: Toast Messages
**Before:**
```jsx
if (success) {
  toast.success("Weight set successfully");
} else {
  toast.error("Failed to set weight");
}
```

**After:**
```jsx
if (success) {
  toast.success(t('messages.weightSetSuccess'));
} else {
  toast.error(t('messages.weightSetError'));
}
```

---

### Example 3: Status Alert Section
**Before:**
```jsx
if (harvest.status === 'DRAFT') {
  return (
    <Alert>
      <AlertTitle>Draft Harvest</AlertTitle>
      <AlertDescription>
        This harvest is in draft status. Set the total weight to proceed with calculations.
      </AlertDescription>
    </Alert>
  );
}
```

**After:**
```jsx
if (harvest.status === 'DRAFT') {
  return (
    <Alert>
      <AlertTitle>{t('status.draft')}</AlertTitle>
      <AlertDescription>
        {t('status.draftDescription')}
      </AlertDescription>
    </Alert>
  );
}
```

---

### Example 4: Common Namespace Reuse
**Before:**
```jsx
<Button variant="outline">Cancel</Button>
<Button variant="primary">Save</Button>
<Button variant="destructive">Delete</Button>
```

**After:**
```jsx
<Button variant="outline">{t('common:actions.cancel')}</Button>
<Button variant="primary">{t('common:actions.save')}</Button>
<Button variant="destructive">{t('common:actions.delete')}</Button>
```

---

## 3. harvest-wizard.tsx

### Example 1: Dialog Trigger Button
**Before:**
```jsx
<DialogTrigger asChild>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Start Harvest
  </Button>
</DialogTrigger>
```

**After:**
```jsx
<DialogTrigger asChild>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    {t('wizard.triggerButton')}
  </Button>
</DialogTrigger>
```

---

### Example 2: Form Fields with Placeholders
**Before:**
```jsx
<Label htmlFor="date">Harvest Date</Label>
<Textarea
  placeholder="Add any notes about this harvest..."
/>
```

**After:**
```jsx
<Label htmlFor="date">{t('wizard.dateLabel')}</Label>
<Textarea
  placeholder={t('wizard.notesPlaceholder')}
/>
```

---

### Example 3: Dynamic Frame Summary with Interpolation
**Before:**
```jsx
<p>
  Selected: {selectedHives.size} hive(s) • {totalFrames} total frames
</p>
```

**After:**
```jsx
<p>
  {t('wizard.frameSummary', {
    selectedCount: selectedHives.size,
    totalFrames: totalFrames,
  })}
</p>
```

**Translation Key (harvest.json):**
```json
"wizard": {
  "frameSummary": "Selected: {{selectedCount}} hive(s) • {{totalFrames}} total frames"
}
```

---

### Example 4: Conditional Button States
**Before:**
```jsx
<Button>
  {createHarvest.isPending ? 'Starting...' : 'Start Harvest'}
</Button>
```

**After:**
```jsx
<Button>
  {createHarvest.isPending
    ? t('wizard.startingButton')
    : t('wizard.startButton')}
</Button>
```

---

### Example 5: Error Messages
**Before:**
```jsx
const handleSubmit = async () => {
  if (selectedHives.size === 0) {
    toast.error("Please select at least one hive");
    return;
  }
  // ...
  try {
    // ...
  } catch (error) {
    toast.error("Failed to create harvest");
  }
};
```

**After:**
```jsx
const handleSubmit = async () => {
  if (selectedHives.size === 0) {
    toast.error(t('wizard.error'));
    return;
  }
  // ...
  try {
    toast.success(t('wizard.successMessage'));
    // ...
  } catch (error) {
    toast.error(t('messages.loadingError'));
  }
};
```

---

## Summary of Translation Keys

### Harvest Namespace Structure
```
harvest.json
├── page (2 keys)
│   ├── title
│   └── description
├── stats (7 keys)
│   ├── totalHarvests
│   ├── totalHoney
│   ├── averageYield
│   ├── latestHarvest
│   ├── completedHarvests (with {{count}} interpolation)
│   ├── fromCompletedHarvests
│   ├── perHarvest
│   └── noData
├── table (8 keys)
│   ├── title
│   ├── headers (with honey using {{unit}} interpolation)
│   ├── date
│   ├── status
│   ├── hives
│   ├── frames
│   └── empty (title, description)
├── details (7 keys)
│   ├── title
│   ├── information
│   └── fields (date, totalHives, totalFrames, totalWeight, notes, noNotes)
├── weight (5 keys)
├── notes (1 key)
├── hiveDistribution (5 keys)
├── wizard (11 keys, with frameSummary using {{selectedCount}} and {{totalFrames}})
├── actions (6 keys)
├── status (6 keys)
└── messages (11 keys)
```

### Common Namespace Keys Reused
- `common:actions.save`
- `common:actions.cancel`
- `common:actions.delete`
- `common:actions.edit`

---

## Key Takeaways

1. **Simple Strings**: Most hardcoded strings are replaced with simple `t('key')` calls
2. **Interpolation**: Dynamic values use second parameter: `t('key', { param: value })`
3. **Namespace Reuse**: Common actions are reused from the common namespace to avoid duplication
4. **Component Setup**: Each component imports `useTranslation` and calls `useTranslation('harvest')`
5. **Type Safety**: All changes maintain TypeScript type safety with 0 errors
6. **Backward Compatible**: All functionality is preserved, only strings are translated

