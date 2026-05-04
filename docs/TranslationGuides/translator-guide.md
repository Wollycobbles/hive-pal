# Translation Guide for Human Translators

**Project:** Hive Pal - Beekeeping Management Application  
**Date:** May 2026  
**Target Languages:** Danish (da), German (de), French (fr), Italian (it), Slovak (sk), Serbian (sr)

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [File Structure](#file-structure)
4. [Translation Guidelines](#translation-guidelines)
5. [Special Syntax](#special-syntax)
6. [Context and Terminology](#context-and-terminology)
7. [Quality Checklist](#quality-checklist)
8. [Submitting Translations](#submitting-translations)
9. [FAQ](#faq)

---

## Overview

### What You're Translating

You will be translating the user interface text for Hive Pal, a comprehensive beekeeping management application. The application helps beekeepers:
- Manage apiaries (bee yards) and hives
- Track inspections and queen bees
- Record harvests and treatments
- Schedule maintenance and feeding
- Collaborate with other beekeepers

### Current State

- **English (en)**: Complete baseline with 552 new keys
- **Other languages (da, de, fr, it, sk, sr)**: Currently contain English placeholder text that needs translation

### Your Goal

Replace English placeholder text in your target language file(s) with accurate, natural translations that maintain the meaning and tone of the original.

---

## Getting Started

### Prerequisites

1. **Text editor**: Use a text editor that supports UTF-8 encoding (VS Code, Sublime Text, Notepad++, or any code editor)
2. **JSON knowledge**: Basic understanding of JSON format (we'll guide you through this)
3. **Language proficiency**: Native or near-native fluency in your target language
4. **Beekeeping context**: Familiarity with beekeeping terminology is helpful but not required

### Files You'll Work With

Translation files are located at:
```
apps/frontend/public/locales/{language}/{namespace}.json
```

Where:
- `{language}` = Your target language code (da, de, fr, it, sk, sr)
- `{namespace}` = Feature area (common, auth, admin, hive, inspection, apiary, queen, harvest, onboarding)

**Example for German translator:**
```
apps/frontend/public/locales/de/common.json
apps/frontend/public/locales/de/auth.json
apps/frontend/public/locales/de/admin.json
apps/frontend/public/locales/de/hive.json
```

---

## File Structure

### JSON Format

Translation files use JSON (JavaScript Object Notation) format. Here's what you need to know:

#### Basic Structure

```json
{
  "section": {
    "subsection": {
      "key": "Translated text goes here"
    }
  }
}
```

#### Important Rules

1. **Preserve structure**: Don't change the keys (left side), only translate the values (right side)
2. **Keep quotes**: Text must be wrapped in double quotes `"`
3. **Escape special characters**: Use `\"` for quotes inside text, `\\` for backslashes
4. **Preserve commas**: Each line except the last in a section needs a comma
5. **Don't translate keys**: Only translate the text values on the right side of the colon

#### Example - What to Change

```json
{
  "actions": {
    "save": "Save",        ← TRANSLATE THIS (right side only)
    "cancel": "Cancel",    ← TRANSLATE THIS
    "delete": "Delete"     ← TRANSLATE THIS
  }
}
```

**For German:**
```json
{
  "actions": {
    "save": "Speichern",   ← Translated value
    "cancel": "Abbrechen", ← Translated value
    "delete": "Löschen"    ← Translated value
  }
}
```

#### What NOT to Change

❌ **Don't change keys (left side):**
```json
{
  "save": "Speichern"  ✓ Correct
  "speichern": "Speichern"  ✗ WRONG - key was changed
}
```

❌ **Don't change interpolation variables:**
```json
{
  "greeting": "Hallo {{name}}"  ✓ Correct - {{name}} preserved
  "greeting": "Hallo {{nome}}"  ✗ WRONG - variable name changed
}
```

---

## Translation Guidelines

### 1. Tone and Style

**Formal vs. Informal:**
- Use **formal/polite** form for:
  - Settings and account management
  - Admin panel and user management
  - Error messages and warnings
  
- Use **friendly/informal** form for:
  - General navigation and actions
  - Success messages and notifications
  - Instructional content

**Example (German):**
```json
{
  "settings": {
    "password": "Ändern Sie Ihr Passwort"  // Formal: "Sie"
  },
  "actions": {
    "save": "Speichern"  // Neutral/friendly
  }
}
```

### 2. Consistency

**Use consistent terminology throughout:**

If you translate "hive" as "Ruche" (French) in one place, use "Ruche" everywhere, not "Colonie" or "Essaim" in other places.

**Common terms to keep consistent:**
- Apiary / Bee yard
- Hive
- Inspection
- Queen bee
- Harvest
- Frame
- Brood
- Treatment

### 3. Cultural Adaptation

**Cultural References:**
- Adapt idioms and expressions to your culture
- Example: "Check out the latest features" might be more naturally expressed differently

### 4. Length and Space

**Be mindful of text length:**
- Some languages are more verbose (German, French) than English
- UI elements have limited space
- Try to keep translations reasonably concise
- If a translation is much longer, consider a shorter synonym

**Button labels** should be especially concise:
```json
{
  "actions": {
    "save": "Save"  // 4 characters
  }
}
```

**Bad German translation:**
```json
{
  "actions": {
    "save": "Speichern und Fortfahren"  // Too long for a button!
  }
}
```

**Good German translation:**
```json
{
  "actions": {
    "save": "Speichern"  // Concise, fits in UI
  }
}
```

### 5. Context Understanding

Some keys appear in specific contexts. Here's how to understand them:

**Namespaces indicate context:**
- `common.json` - General UI elements used everywhere
- `auth.json` - Login, registration, password management
- `admin.json` - Administrative functions
- `hive.json` - Hive-specific features
- `inspection.json` - Inspection records and data
- `apiary.json` - Apiary (bee yard) management
- `queen.json` - Queen bee tracking
- `harvest.json` - Honey harvest records

**Key structure provides hints:**
```json
{
  "sharing": {
    "members": {
      "heading": "Active Members ({{count}})"
    }
  }
}
```

This is a heading in the sharing/collaboration section, showing member count.

---

## Special Syntax

### Interpolation Variables

**What are they?**
Variables in curly braces `{{variableName}}` are replaced with actual values at runtime.

**Examples:**
```json
{
  "greeting": "Hello {{name}}",
  "count": "You have {{count}} new messages",
  "success": "Password changed successfully for {{email}}"
}
```

**How to translate:**

✓ **Correct - Move the variable to fit your language's grammar:**
```json
// English
"greeting": "Hello {{name}}, welcome back!"

// German
"greeting": "Hallo {{name}}, willkommen zurück!"

// French
"greeting": "Bonjour {{name}}, bienvenue !"

// Serbian (Cyrillic)
"greeting": "Здраво {{name}}, добродошли назад!"
```

✗ **Wrong - Don't translate or modify the variable name:**
```json
// English
"greeting": "Hello {{name}}"

// WRONG - variable name changed
"greeting": "Bonjour {{nom}}"  ✗

// CORRECT
"greeting": "Bonjour {{name}}"  ✓
```

### Common Variables

| Variable | Meaning | Example |
|----------|---------|---------|
| `{{count}}` | Number/count | "{{count}} items" |
| `{{name}}` | User/entity name | "Hello {{name}}" |
| `{{email}}` | Email address | "Sent to {{email}}" |
| `{{date}}` | Date value | "Updated on {{date}}" |
| `{{minimum}}` | Minimum value | "At least {{minimum}} characters" |
| `{{maximum}}` | Maximum value | "Max {{maximum}} items" |

### Pluralization

Some keys handle plural forms. i18next (our translation library) supports pluralization:

**English example:**
```json
{
  "item_one": "{{count}} item",
  "item_other": "{{count}} items"
}
```

**For languages with different plural rules:**

**German (2 forms):**
```json
{
  "item_one": "{{count}} Element",
  "item_other": "{{count}} Elemente"
}
```

**French (2 forms):**
```json
{
  "item_one": "{{count}} élément",
  "item_other": "{{count}} éléments"
}
```

**Slovak (3 forms):**
```json
{
  "item_one": "{{count}} položka",
  "item_few": "{{count}} položky",
  "item_other": "{{count}} položiek"
}
```

**Serbian (3 forms):**
```json
{
  "item_one": "{{count}} ставка",
  "item_few": "{{count}} ставке",
  "item_other": "{{count}} ставки"
}
```

**Note:** If you see `_one`, `_few`, `_other` suffixes, translate according to your language's plural rules. If you're unsure, ask the development team.

### HTML Tags

Some translations may contain HTML tags for formatting:

```json
{
  "message": "Click <strong>here</strong> to continue"
}
```

**How to translate:**

✓ **Correct - Keep tags, translate text:**
```json
// German
"message": "Klicken Sie <strong>hier</strong>, um fortzufahren"

// French
"message": "Cliquez <strong>ici</strong> pour continuer"
```

✗ **Wrong - Don't remove or modify tags:**
```json
"message": "Klicken Sie hier, um fortzufahren"  ✗ (missing <strong> tags)
"message": "Klicken Sie <fort>hier</fort>, um fortzufahren"  ✗ (tag changed)
```

### Special Characters

**Escaping quotes:**
If your translation contains a quotation mark, escape it with a backslash:

```json
{
  "message": "Click \"Save\" to continue"
}
```

**Apostrophes** (single quotes) don't need escaping:
```json
{
  "message": "It's your turn"
}
```

**Newlines:**
Use `\n` for line breaks:
```json
{
  "message": "Line 1\nLine 2"
}
```

---

## Context and Terminology

### Beekeeping-Specific Terms

Here's a glossary of key beekeeping terms with context:

| English | Context | Notes |
|---------|---------|-------|
| **Apiary** | A location where beehives are kept | Also called "bee yard" |
| **Hive** | A single bee colony's home | The box structure |
| **Inspection** | Regular check of a hive's health | Look for disease, queen, stores |
| **Queen** | The mother bee of the colony | Only one per hive normally |
| **Brood** | Eggs, larvae, and pupae | Developing bees |
| **Frame** | Removable structure inside hive | Contains comb |
| **Super** | Box added for honey storage | "Honey super" |
| **Treatment** | Medicine/intervention for pests | Varroa treatment, etc. |
| **Feeding** | Supplemental sugar syrup | When nectar is scarce |
| **Harvest** | Collecting honey from hive | Usually once or twice per year |
| **Swarm** | When colony splits naturally | Half the bees leave with old queen |

**Translation Resources:**
- Use standard beekeeping terminology for your region
- Consult local beekeeping associations for terminology
- Check beekeeping books/websites in your language

### UI-Specific Terms

| English | Context | Notes |
|---------|---------|-------|
| **Dashboard** | Main overview page | Central hub after login |
| **Settings** | User preferences | Account configuration |
| **Navigation** | Menu items | Sidebar links |
| **Toast/Alert** | Brief popup notification | Success/error messages |
| **Dialog/Modal** | Popup window | Requires user action |
| **Tooltip** | Hover text hint | Brief help text |
| **Placeholder** | Grayed text in input | Example: "Enter your name" |
| **Empty state** | No data message | "No items found" |

---

## Quality Checklist

Before submitting your translations, verify:

### 1. JSON Validity

- [ ] File is valid JSON (no syntax errors)
- [ ] All keys are preserved (left side unchanged)
- [ ] All quotes are properly escaped
- [ ] All commas are in place
- [ ] No trailing commas on last items in sections

**How to check:** Use a JSON validator like [jsonlint.com](https://jsonlint.com/)

### 2. Translation Completeness

- [ ] No English text remains (except in technical contexts)
- [ ] All values have been translated
- [ ] No keys have been deleted or skipped

### 3. Variables and Syntax

- [ ] All `{{variables}}` are preserved with original names
- [ ] HTML tags (if any) are preserved
- [ ] Special characters are properly escaped
- [ ] Plural forms follow your language's rules

### 4. Language Quality

- [ ] Grammar is correct
- [ ] Spelling is accurate
- [ ] Tone is appropriate (formal where needed)
- [ ] Terminology is consistent throughout
- [ ] Text length is reasonable for UI

### 5. Context Appropriateness

- [ ] Translations make sense in context
- [ ] Button/action labels are concise
- [ ] Error messages are clear and helpful
- [ ] Beekeeping terms are accurate

---

## Submitting Translations

### Option 1: Direct File Edit (Preferred)

1. **Clone or download** the repository
2. **Navigate** to `apps/frontend/public/locales/{your-language}/`
3. **Edit** the JSON files directly
4. **Validate** using a JSON validator
5. **Submit** via pull request or send files to the development team

### Option 2: Spreadsheet Method

If JSON editing is challenging, the development team can provide translations in spreadsheet format:

1. Request a **translation spreadsheet** from the team
2. **Fill in** your translations in the appropriate column
3. **Return** the completed spreadsheet
4. Team will convert it back to JSON format

### What to Submit

**Complete submissions should include:**
- All 4 namespace files for your language:
  - `common.json` (largest file, ~65 keys to translate)
  - `auth.json` (~14 keys to translate)
  - `admin.json` (~4 keys to translate)
  - `hive.json` (~9 keys to translate)

**Or submit incrementally:**
- You can submit one namespace at a time
- Start with `common.json` (most important)
- Then `auth.json`, `admin.json`, `hive.json`

### Review Process

1. **Team validates** JSON syntax
2. **Team tests** translations in the app
3. **Team may ask** for clarifications or adjustments
4. **Translations are merged** into the codebase
5. **You'll be credited** in the project contributors

---

## FAQ

### Q: I don't understand what a key means without context. What should I do?

**A:** Ask the development team! Provide the key path (e.g., `common.sharing.members.heading`) and we'll explain where it appears and what it does.

### Q: Can I change the structure or add/remove keys?

**A:** No. Only translate the values (right side). The keys (left side) and structure must remain exactly as they are.

### Q: What if a translation is much longer than the English version?

**A:** Try to find a more concise alternative that preserves the meaning. If impossible, note it for the team to review (UI may need adjustment).

### Q: Should I translate technical terms like "API", "JSON", "database"?

**A:** Generally no. Keep technical/programming terms in English. Translate user-facing concepts only.

### Q: What about brand names and proper nouns?

**A:** Keep them in their original form:
- "HivePal" - don't translate
- "Google", "Microsoft" - don't translate
- Common nouns like "email", "calendar" - translate

### Q: My language has formal and informal forms. Which should I use?

**A:** Use formal for settings, admin, and error messages. Use friendly/informal for general actions and navigation. When in doubt, use formal.

### Q: How do I handle gender in languages with grammatical gender?

**A:** Use neutral forms when possible. For user-referring text, default to gender-neutral or use masculine as the generic form (common in many languages). The app doesn't currently have per-user gender settings.

### Q: I found an error in the English source text. What should I do?

**A:** Report it to the development team, but still translate it accurately. The team will fix the English version and you can update your translation later.

### Q: Can I use machine translation (Google Translate, DeepL)?

**A:** Machine translation can be a starting point, but **must be reviewed and corrected by a human**. Many translations need context and cultural adaptation that machines can't provide. Always review and improve machine translations.

### Q: What character encoding should I use?

**A:** UTF-8. Most modern text editors default to this. It's essential for special characters (é, ñ, ö, ć, etc.).

### Q: Where can I see my translations in action?

**A:** After your translations are merged, the development team can provide:
- A preview link to test your translations
- Screenshots of how they appear in the UI
- A development environment you can access

---

## Example Translation Workflow

Here's a step-by-step example of translating a section:

### English source (common.json):
```json
{
  "sharing": {
    "inviteLink": {
      "title": "Invite Links",
      "create": "Create Link",
      "noLinks": "No active invite links. Create one to share this apiary."
    },
    "members": {
      "heading": "Active Members ({{count}})",
      "noMembers": "No members yet. Share an invite link to get started."
    }
  }
}
```

### Step 1: Understand the Context

This is in the **sharing** section, related to inviting others to collaborate on an apiary.

- `inviteLink.title` - Heading for the invite links section
- `inviteLink.create` - Button to create a new invite link
- `inviteLink.noLinks` - Message when there are no invite links yet
- `members.heading` - Heading showing active member count
- `members.noMembers` - Message when there are no members yet

### Step 2: Translate (German example)

```json
{
  "sharing": {
    "inviteLink": {
      "title": "Einladungslinks",
      "create": "Link erstellen",
      "noLinks": "Keine aktiven Einladungslinks. Erstellen Sie einen, um diesen Bienenstand zu teilen."
    },
    "members": {
      "heading": "Aktive Mitglieder ({{count}})",
      "noMembers": "Noch keine Mitglieder. Teilen Sie einen Einladungslink, um loszulegen."
    }
  }
}
```

### Step 3: Verify

- [x] Keys unchanged (inviteLink, title, create, etc.)
- [x] `{{count}}` variable preserved
- [x] JSON syntax valid
- [x] German grammar correct
- [x] Terminology consistent ("Einladungslink" throughout)
- [x] Tone appropriate (formal Sie form)

### Step 4: Submit

File ready for submission!

---

## Support and Questions

**Need help?** Contact the development team:

- **Email**: [insert contact email]
- **GitHub Issues**: [repository link]
- **Slack/Discord**: [communication channel]

**Questions to ask:**
- "What does this key mean?"
- "Where does this text appear in the UI?"
- "Should I use formal or informal tone here?"
- "Is this beekeeping term correct?"
- "The English text seems incorrect - can you verify?"

---

## Contributor Recognition

All translators will be credited in:
- Project README
- Application about page
- Release notes
- Contributor list

Thank you for helping make HivePal accessible to beekeepers worldwide! 🐝

---

**Document Version:** 1.0  
**Last Updated:** May 2026  
**Languages Supported:** Danish, German, French, Italian, Slovak, Serbian  
**Next Review:** June 2026
