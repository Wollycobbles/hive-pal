# Translation Key Naming Convention and Namespace Strategy

## Overview

This document describes the translation key naming convention and namespace strategy used in the Hive Pal application. This ensures consistency, maintainability, and scalability across all 7 supported languages.

## Key Naming Pattern

All translation keys follow a **hierarchical dot-notation pattern**:

```
namespace.section.subsection.key
```

### Components

1. **namespace**: Feature area (e.g., `common`, `auth`, `admin`, `hive`)
2. **section**: Logical grouping within namespace (e.g., `buttons`, `labels`, `errors`)
3. **subsection**: Optional refinement (e.g., `validation.required`)
4. **key**: Specific translation key (e.g., `submit`, `email_address`)

### Examples

```
common.actions.save               → "Save" button
auth.changePassword.labels.old    → "Current Password" label
admin.errors.userNotFound         → "User not found" error
validation.required               → "This field is required"
```

## Namespace Strategy

### Primary Namespaces

The application uses **8 namespaces** organized by feature area:

#### 1. **common** (Most Used)
General UI elements shared across the application.

**Sections:**
- `actions`: Buttons and links (save, delete, edit, cancel, submit)
- `navigation`: Menu items and navigation labels
- `sharing`: Sharing/collaboration UI strings
- `permissions`: Permission-related text (Owner, Editor, Viewer)
- `dialogs`: Dialog titles, messages, confirmations
- `status`: Loading, empty state, and status messages
- `alerts`: Toast notifications (success, error, warning)
- `errors`: Generic error messages
- `validation`: Form validation messages
- `accessibility`: Screen reader labels and alt text

**Key Count**: ~180 keys

**Example Keys:**
```
common.actions.save              → "Save"
common.actions.delete            → "Delete"
common.actions.cancel            → "Cancel"
common.navigation.dashboard      → "Dashboard"
common.sharing.inviteLink.copy   → "Copy link"
common.permissions.owner         → "Owner"
common.dialogs.confirmDelete     → "Are you sure?"
common.status.loading            → "Loading..."
common.status.empty.noItems      → "No items found"
common.alerts.success.saved      → "Saved successfully"
common.errors.networkError       → "Network error occurred"
common.validation.required       → "This field is required"
```

#### 2. **auth**
Authentication and password management.

**Sections:**
- `changePassword`: Password change flow
  - `labels`: Form field labels
  - `errors`: Validation and error messages
  - `success`: Success messages
  - `placeholder`: Input placeholders
- `validation`: Auth-specific validation rules
- `login`: Login-related strings (if applicable)

**Key Count**: ~40 keys

**Example Keys:**
```
auth.changePassword.labels.current     → "Current Password"
auth.changePassword.labels.new         → "New Password"
auth.changePassword.errors.incorrect   → "Current password is incorrect"
auth.changePassword.success.changed    → "Password changed successfully for {{email}}"
auth.validation.weakPassword           → "Password must contain..."
```

#### 3. **admin**
Administrator panel and user management.

**Sections:**
- `users`: User management interface
- `errors`: Admin-specific error messages
- `actions`: Admin-specific actions
- `status`: Admin-specific status messages

**Key Count**: ~40 keys

**Example Keys:**
```
admin.users.table.email    → "Email"
admin.users.table.role     → "Role"
admin.users.manage.add     → "Add User"
admin.errors.userNotFound  → "User not found"
admin.actions.deactivate   → "Deactivate User"
```

#### 4. **hive**
Hive-related domain strings.

**Sections:**
- `labels`: Field labels
- `messages`: Status and informational messages
- `errors`: Hive-specific errors

**Key Count**: ~30 keys

**Example Keys:**
```
hive.labels.name          → "Hive Name"
hive.labels.queenStatus   → "Queen Status"
hive.messages.queenLaid   → "Queen is laying"
```

#### 5. **inspection**
Inspection domain strings.

**Sections:**
- `labels`: Inspection form labels
- `messages`: Status messages
- `validations`: Inspection-specific validation

**Key Count**: ~50 keys

**Example Keys:**
```
inspection.labels.date     → "Inspection Date"
inspection.labels.notes    → "Notes"
inspection.messages.saved  → "Inspection saved successfully"
```

#### 6. **apiary**
Apiary domain strings.

**Sections:**
- `labels`: Apiary form labels
- `messages`: Apiary-related messages

**Key Count**: ~25 keys

**Example Keys:**
```
apiary.labels.name       → "Apiary Name"
apiary.labels.location   → "Location"
```

#### 7. **queen**
Queen management strings.

**Sections:**
- `labels`: Queen-related labels
- `status`: Queen status indicators

**Key Count**: ~20 keys

**Example Keys:**
```
queen.labels.bornYear    → "Year Born"
queen.status.healthy     → "Healthy"
queen.status.failing     → "Failing"
```

#### 8. **harvest**
Harvest tracking strings.

**Sections:**
- `labels`: Harvest form labels
- `types`: Harvest types

**Key Count**: ~15 keys

**Example Keys:**
```
harvest.labels.date       → "Harvest Date"
harvest.types.honey       → "Honey"
harvest.types.pollen      → "Pollen"
```

### Namespace Assignment Rules

1. **Always use most specific namespace first**
   - ✅ `auth.changePassword.errors.required` (specific)
   - ❌ `common.validation.required` (generic)

2. **Use `common` for truly generic UI elements**
   - Buttons: save, delete, cancel, submit
   - Navigation: menu items shared across app
   - Accessibility: generic aria-labels
   - Generic validation: only if not domain-specific

3. **Never mix business logic namespaces**
   - ✅ `inspection.labels.temperature` (specific to inspection)
   - ❌ `common.labels.temperature` (belongs in inspection)

4. **Keep domain namespaces focused**
   - Each domain namespace (`hive`, `inspection`, `apiary`) handles its own terminology
   - Don't cross-reference between domains
   - Shared concepts duplicate in their respective namespaces if needed

5. **Alphabetical ordering within sections**
   - Keys within sections maintain alphabetical order
   - Improves readability and findability
   - Example: `actions.add`, `actions.cancel`, `actions.delete`, `actions.edit`

## Key Naming Best Practices

### 1. Use Lowercase with Underscores for Multi-Word Keys

```
✅ common.actions.save_changes
❌ common.actions.saveChanges
❌ common.actions.SaveChanges
```

### 2. Use Descriptive Key Names

```
✅ common.validation.email_invalid
❌ common.validation.bad_email
```

### 3. Use Consistent Terminology

```
✅ Use "email" consistently
✅ Use "password" consistently
❌ Don't mix "email" and "mail_address"
```

### 4. Include Placeholder Names in Keys When Using Interpolation

```
✅ "Saved by {{user_name}}" - key indicates interpolation
✅ "Password changed for {{email}}" - clear what's interpolated
❌ "Saved" - doesn't indicate dynamic content
```

### 5. Plurals are Handled by Pluralization Function

```
✅ "You have {{count}} member"
   (i18next pluralization rules handle singular/plural)
❌ common.labels.members_singular
❌ common.labels.members_plural
```

### 6. Use Consistent Section Names

Across all namespaces, use consistent section patterns:
- `labels` - form field labels, headings
- `errors` - error messages
- `messages` - informational messages
- `status` - status indicators
- `validation` - validation rules
- `actions` - button labels
- `placeholders` - input placeholders
- `descriptions` - help text, descriptions

## Special Cases

### Accessibility Attributes

Accessibility attributes get their own section:

```
common.accessibility.button_save              → aria-label for save button
common.accessibility.button_delete            → aria-label for delete button
admin.accessibility.user_table_header         → aria-label for user table
```

**Important:** Technical ARIA attributes like `role`, `aria-hidden`, `aria-expanded` are **NOT translated** - only the readable labels are.

### Dynamic Interpolation

Keys for messages with dynamic content:

```
auth.changePassword.success.changed           → "Password changed successfully for {{email}}"
common.alerts.success.item_created            → "{{item_name}} created successfully"
inspection.messages.member_added              → "Added {{member_name}} to inspection"
```

### Form Validation with Constraints

```
common.validation.min_length                  → "Minimum length is {{min}} characters"
common.validation.max_length                  → "Maximum length is {{max}} characters"
common.validation.between                     → "Must be between {{min}} and {{max}}"
inspection.validation.frames_range            → "Frames must be between {{min}} and {{max}}"
```

### Pluralization

```
i18next automatically handles pluralization:
"{{count}} member" → "1 member" or "3 members"
"{{count}} frame" → "1 frame" or "5 frames"
```

Implementation:
```typescript
t('common.status.members_count', { count: 3 })
// English: "3 members"
// Danish: "3 medlemmer"
// German: "3 Mitglieder"
```

## File Organization

### Directory Structure

```
apps/frontend/public/locales/
├── en/                        # English translations (source)
│   ├── common.json           # Common namespace
│   ├── auth.json             # Auth namespace
│   ├── admin.json            # Admin namespace
│   ├── hive.json             # Hive namespace
│   ├── inspection.json        # Inspection namespace
│   ├── apiary.json           # Apiary namespace
│   ├── queen.json            # Queen namespace
│   └── harvest.json          # Harvest namespace
├── da/                        # Danish (auto-generated by backfill script)
├── de/                        # German (auto-generated by backfill script)
├── fr/                        # French (auto-generated by backfill script)
├── it/                        # Italian (auto-generated by backfill script)
├── sk/                        # Slovak (auto-generated by backfill script)
└── sr/                        # Serbian (auto-generated by backfill script)
```

### JSON Structure Within Files

```json
{
  "actions": {
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "save": "Save"
  },
  "dialogs": {
    "confirmDelete": "Are you sure you want to delete this?"
  },
  "errors": {
    "networkError": "A network error occurred"
  },
  "navigation": {
    "apiaries": "Apiaries",
    "batchInspections": "Batch Inspections",
    "dashboard": "Dashboard"
  },
  "permissions": {
    "editor": "Editor",
    "owner": "Owner",
    "viewer": "Viewer"
  },
  "sharing": {
    "inviteLink": {
      "copy": "Copy link",
      "generate": "Generate new link"
    }
  }
}
```

## Adding New Translations

### When Adding a New Feature

1. **Identify the namespace**
   - Is it domain-specific? Use domain namespace (`hive`, `inspection`, etc.)
   - Is it generic UI? Use `common`
   - Is it auth-specific? Use `auth`
   - Is it admin-specific? Use `admin`

2. **Create section if needed**
   - Group related keys under a section
   - Use existing section names if applicable
   - Create new section only if necessary

3. **Name the key descriptively**
   - Follow lowercase_with_underscores pattern
   - Be specific about context
   - Include placeholder names if using interpolation

4. **Add to English namespace first**
   - Update `apps/frontend/public/locales/en/{namespace}.json`
   - Keep keys alphabetically sorted within sections
   - Ensure valid JSON

5. **Run backfill script**
   - `node scripts/translation-backfill-scripts/backfill-translations.js`
   - Script copies key structure to all other languages
   - Keys appear with English values or placeholders in non-English files

6. **Verify the changes**
   - Check git diff for the locales directory
   - Verify all 7 languages have the new keys
   - Verify valid JSON in all files

### Example: Adding "Export Data" Feature

1. Create keys in `apps/frontend/public/locales/en/common.json`:

```json
{
  "actions": {
    "export": "Export",
    "import": "Import"
  }
}
```

2. Run backfill script:

```bash
node scripts/translation-backfill-scripts/backfill-translations.js
```

3. Result: All language files now have:

```json
{
  "actions": {
    "export": "Export",    // English (real translation)
    "import": "Import"     // English (real translation)
  }
}
```

In other languages, translator would update these to:
- Danish: `"export": "Eksport", "import": "Importér"`
- German: `"export": "Exportieren", "import": "Importieren"`
- Etc.

## Maintenance Guidelines

### Regular Review

1. **Quarterly audit** of translation keys
   - Look for unused keys
   - Look for duplicate keys
   - Verify naming consistency

2. **Monitor key growth**
   - Track keys added per release
   - Consider splitting large namespaces if they exceed 200 keys
   - Keep namespace sizes manageable

3. **Deprecate unused keys**
   - Mark deprecated keys with comment
   - Wait 2 releases before removing
   - Update documentation when removing

### Consistency Checks

1. **Verify key parity**
   - All 7 languages should have same keys
   - Missing keys indicate backfill script issue
   - Use script: `find apps/frontend/public/locales -name "*.json" -exec jq keys[] {} \; | sort | uniq -c`

2. **Verify JSON syntax**
   - Use `jq` to validate: `cat file.json | jq .`
   - Check no trailing commas
   - Check all quotes are double-quotes

3. **Verify naming consistency**
   - Use grep to check pattern: `grep -r "camelCase" apps/frontend/public/locales`
   - Should find none (all keys should be lowercase_with_underscores)

## Migration Checklist

When adding new keys:

- [ ] Key follows naming convention (lowercase_with_underscores)
- [ ] Key placed in correct namespace
- [ ] Key placed in correct section
- [ ] Key alphabetically sorted within section
- [ ] JSON is valid
- [ ] Added to English file first
- [ ] Backfill script run successfully
- [ ] All 7 languages have the key
- [ ] All JSON files are valid
- [ ] Component uses new key with `t('namespace.section.key')`
- [ ] TypeScript compiles without errors
- [ ] Tested in multiple languages
- [ ] No console warnings about missing translations

## Summary

This naming convention and namespace strategy ensures:

✅ **Consistency** - Uniform naming across all translations
✅ **Maintainability** - Easy to find and update keys
✅ **Scalability** - Organized structure supports growth
✅ **Clarity** - Key names indicate content and context
✅ **Accessibility** - Support for screen readers and ARIA
✅ **Interpolation** - Clear indication of dynamic content
✅ **Multi-language** - Works seamlessly across 7 languages

Following these guidelines makes the translation system robust and professional.
