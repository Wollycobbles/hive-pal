# Translation Quick Reference Guide

**Quick lookup guide for translators working on HivePal translations**

---

## Translation Statistics (What to Expect)

| Namespace | Keys to Translate | Priority | Estimated Time |
|-----------|------------------|----------|----------------|
| **common.json** | ~65 keys | HIGH | 2-3 hours |
| **auth.json** | ~14 keys | HIGH | 30 minutes |
| **admin.json** | ~4 keys | MEDIUM | 15 minutes |
| **hive.json** | ~9 keys | MEDIUM | 30 minutes |
| **Total** | ~92 keys | - | 3-4 hours |

---

## Common Variables Reference

| Variable | What It Represents | Example Usage |
|----------|-------------------|---------------|
| `{{count}}` | A number/quantity | "{{count}} members", "You have {{count}} notifications" |
| `{{name}}` | Person or entity name | "Hello {{name}}", "Edit {{name}}" |
| `{{email}}` | Email address | "Sent to {{email}}", "Password reset for {{email}}" |
| `{{date}}` | Date value | "Last updated {{date}}", "Created on {{date}}" |
| `{{minimum}}` | Minimum value/length | "At least {{minimum}} characters" |
| `{{maximum}}` | Maximum value/length | "Maximum {{maximum}} items" |
| `{{label}}` | Dynamic label text | "Increase {{label}}", "Decrease {{label}}" |

**Remember:** Never change variable names, only position them correctly for your language's grammar!

---

## Beekeeping Terminology by Language

### English → German (Deutsch)

| English | German | Notes |
|---------|--------|-------|
| Apiary | Bienenstand | |
| Hive | Bienenstock / Beute | |
| Inspection | Durchsicht / Inspektion | |
| Queen | Königin / Weisel | |
| Brood | Brut | |
| Frame | Rähmchen | |
| Super | Honigraum / Zarge | |
| Treatment | Behandlung | |
| Feeding | Fütterung | |
| Harvest | Ernte | |
| Swarm | Schwarm | |
| Varroa | Varroamilbe | |

### English → French (Français)

| English | French | Notes |
|---------|--------|-------|
| Apiary | Rucher | |
| Hive | Ruche | |
| Inspection | Inspection / Visite | |
| Queen | Reine | |
| Brood | Couvain | |
| Frame | Cadre | |
| Super | Hausse | |
| Treatment | Traitement | |
| Feeding | Nourrissement | |
| Harvest | Récolte | |
| Swarm | Essaim | |
| Varroa | Varroa | |

### English → Italian (Italiano)

| English | Italian | Notes |
|---------|---------|-------|
| Apiary | Apiario | |
| Hive | Arnia / Alveare | |
| Inspection | Ispezione / Visita | |
| Queen | Regina | |
| Brood | Covata | |
| Frame | Telaino | |
| Super | Melario | |
| Treatment | Trattamento | |
| Feeding | Nutrizione | |
| Harvest | Raccolta | |
| Swarm | Sciame | |
| Varroa | Varroa | |

### English → Danish (Dansk)

| English | Danish | Notes |
|---------|--------|-------|
| Apiary | Bigård | |
| Hive | Bistade / Kube | |
| Inspection | Inspektion / Eftersyn | |
| Queen | Dronning | |
| Brood | Yngel | |
| Frame | Ramme | |
| Super | Honningrumme | |
| Treatment | Behandling | |
| Feeding | Fodring | |
| Harvest | Høst | |
| Swarm | Sværm | |
| Varroa | Varroamide | |

### English → Slovak (Slovenčina)

| English | Slovak | Notes |
|---------|--------|-------|
| Apiary | Včelín / Včelnica | |
| Hive | Úľ | |
| Inspection | Kontrola / Prehliadka | |
| Queen | Matka / Kráľovná | |
| Brood | Plod | |
| Frame | Rámik | |
| Super | Nadstavok | |
| Treatment | Ošetrenie / Liečba | |
| Feeding | Prikrmovanie | |
| Harvest | Úroda / Zber | |
| Swarm | Roj | |
| Varroa | Varroa | |

### English → Serbian (Српски)

| English | Serbian (Cyrillic) | Serbian (Latin) | Notes |
|---------|-------------------|-----------------|-------|
| Apiary | Пчелињак | Pčelinjak | |
| Hive | Кошница | Košnica | |
| Inspection | Преглед / Инспекција | Pregled / Inspekcija | |
| Queen | Матица | Matica | |
| Brood | Легло / Засед | Leglo / Zased | |
| Frame | Рамчић / Рам | Ramčić / Ram | |
| Super | Надградња | Nadgradnja | |
| Treatment | Третман | Tretman | |
| Feeding | Храњење | Hranjenje | |
| Harvest | Берба | Berba | |
| Swarm | Рој | Roj | |
| Varroa | Вароа | Varoa | |

**Note:** For Serbian, use Cyrillic script as the primary form in the translation files.

---

## UI Terminology by Language

### English → German

| English | German | Context |
|---------|--------|---------|
| Dashboard | Dashboard / Übersicht | Main page |
| Settings | Einstellungen | User preferences |
| Save | Speichern | Button |
| Cancel | Abbrechen | Button |
| Delete | Löschen | Button |
| Edit | Bearbeiten | Button |
| Create | Erstellen | Button |
| Close | Schließen | Button |
| Confirm | Bestätigen | Button |
| Loading... | Lädt... | Status |
| No data available | Keine Daten verfügbar | Empty state |
| Success | Erfolg | Toast |
| Error | Fehler | Toast |
| Warning | Warnung | Toast |

### English → French

| English | French | Context |
|---------|--------|---------|
| Dashboard | Tableau de bord | Main page |
| Settings | Paramètres | User preferences |
| Save | Enregistrer | Button |
| Cancel | Annuler | Button |
| Delete | Supprimer | Button |
| Edit | Modifier | Button |
| Create | Créer | Button |
| Close | Fermer | Button |
| Confirm | Confirmer | Button |
| Loading... | Chargement... | Status |
| No data available | Aucune donnée disponible | Empty state |
| Success | Succès | Toast |
| Error | Erreur | Toast |
| Warning | Avertissement | Toast |

### English → Italian

| English | Italian | Context |
|---------|---------|---------|
| Dashboard | Pannello di controllo | Main page |
| Settings | Impostazioni | User preferences |
| Save | Salva | Button |
| Cancel | Annulla | Button |
| Delete | Elimina | Button |
| Edit | Modifica | Button |
| Create | Crea | Button |
| Close | Chiudi | Button |
| Confirm | Conferma | Button |
| Loading... | Caricamento... | Status |
| No data available | Nessun dato disponibile | Empty state |
| Success | Successo | Toast |
| Error | Errore | Toast |
| Warning | Avviso | Toast |

---

## JSON Syntax Quick Reference

### Basic Structure
```json
{
  "key": "value",
  "nested": {
    "key": "value"
  }
}
```

### Special Characters

| Character | How to Write | Example |
|-----------|--------------|---------|
| Double quote `"` | `\"` | `"He said \"hello\""` |
| Backslash `\` | `\\` | `"Path: C:\\Users"` |
| Newline | `\n` | `"Line 1\nLine 2"` |
| Tab | `\t` | `"Name\tValue"` |

### Common Mistakes

❌ **Wrong:**
```json
{
  "key": "value"  ← Missing comma
  "key2": "value2"
}
```

✅ **Correct:**
```json
{
  "key": "value",  ← Comma added
  "key2": "value2"
}
```

❌ **Wrong:**
```json
{
  "key": 'value'  ← Single quotes
}
```

✅ **Correct:**
```json
{
  "key": "value"  ← Double quotes
}
```

---

## Translation Patterns

### Pattern 1: Simple Translation
```json
// English
"save": "Save"

// Your language
"save": "[Your translation]"
```

### Pattern 2: With Variable
```json
// English
"greeting": "Hello {{name}}, welcome!"

// Your language (move {{name}} to fit grammar)
"greeting": "[Translation] {{name}} [translation]"
```

### Pattern 3: With Multiple Variables
```json
// English
"message": "{{count}} items updated on {{date}}"

// Your language (order as needed)
"message": "[Translation] {{date}} [translation] {{count}} [translation]"
```

### Pattern 4: With HTML
```json
// English
"message": "Click <strong>here</strong> to continue"

// Your language (keep tags, translate text)
"message": "[Translation] <strong>[here]</strong> [translation]"
```

### Pattern 5: Plural Forms
```json
// English
"item_one": "{{count}} item"
"item_other": "{{count}} items"

// Your language (adjust based on plural rules)
"item_one": "[singular form]"
"item_few": "[few form]"  // If your language has this
"item_other": "[plural form]"
```

---

## Common Translation Scenarios

### Scenario: Button Labels

**Keep them short!** Buttons have limited space.

✅ **Good:**
- Save → Speichern (German)
- Cancel → Annuler (French)
- Delete → Elimina (Italian)

❌ **Too long:**
- Save → Daten speichern und fortfahren (German) - too verbose!

### Scenario: Error Messages

**Be clear and helpful.**

✅ **Good:**
```json
"passwordTooShort": "Das Passwort muss mindestens {{minimum}} Zeichen lang sein"
```

❌ **Too vague:**
```json
"passwordTooShort": "Fehler"  // Not helpful!
```

### Scenario: Empty States

**Be friendly and guide the user.**

✅ **Good:**
```json
"noMembers": "Noch keine Mitglieder. Teilen Sie einen Einladungslink, um loszulegen."
```

❌ **Too technical:**
```json
"noMembers": "NULL SET RETURNED FROM MEMBER QUERY"  // Way too technical!
```

### Scenario: Success Messages

**Be positive and specific.**

✅ **Good:**
```json
"photoUploaded": "Foto erfolgreich hochgeladen"
```

❌ **Too generic:**
```json
"photoUploaded": "OK"  // Not specific enough
```

---

## Testing Your Translation

### Visual Length Test

After translating, check if your text would fit in typical UI elements:

**Button:** Max ~15 characters ideal  
**Heading:** Max ~50 characters  
**Description:** Max ~150 characters  
**Error message:** Max ~200 characters  

### Grammar Test

Read your translation aloud. Does it sound natural?

❌ Awkward: "Für das Speichern klicken Sie hier"  
✅ Natural: "Klicken Sie hier zum Speichern"

### Consistency Test

Search your file for the same concept:
- Did you use "Löschen" everywhere for "delete"?
- Or did you mix "Löschen", "Entfernen", "Tilslutte"?

Be consistent!

---

## File-by-File Breakdown

### common.json (~65 keys)

**Sections:**
- `sharing` - Collaboration features (15 keys)
- `permissions` - Access control (2 keys)
- `dialogs` - Popup confirmations (4 keys)
- `actions` - Button labels (3 keys)
- `status` - Loading/empty states (4 keys)
- `alerts` - Notifications (11 keys)
- `errors` - Error messages (3 keys)
- `validation` - Form validation (4 keys)
- `ui` - General UI elements (10 keys)
- `charts` - Chart labels (5 keys)
- Other sections (4 keys)

**Priority:** HIGH - most visible to users

### auth.json (~14 keys)

**Sections:**
- `changePassword.labels` - Form labels (4 keys)
- `changePassword.errors` - Error messages (4 keys)
- `changePassword.hints` - Help text (2 keys)
- `changePassword.success` - Success message (1 key)
- `validation` - Auth validation (3 keys)

**Priority:** HIGH - login/password flows

### admin.json (~4 keys)

**Sections:**
- `errors` - Admin error messages (3 keys)
- `users` - User management (1 key)

**Priority:** MEDIUM - admin users only

### hive.json (~9 keys)

**Sections:**
- `charts` - Hive chart labels (8 keys)
- `sections` - Section headings (1 key)

**Priority:** MEDIUM - domain-specific

---

## Validation Checklist

Before submitting, verify each file:

### JSON Syntax
- [ ] File passes JSON validation (use jsonlint.com)
- [ ] No trailing commas on last items
- [ ] All quotes are double quotes `"`
- [ ] Special characters properly escaped

### Translation Completeness
- [ ] No English text remains (except variables)
- [ ] All values translated
- [ ] No missing keys

### Variables and Formatting
- [ ] All `{{variables}}` preserved exactly
- [ ] HTML tags (if any) preserved
- [ ] Plural forms match your language's rules

### Language Quality
- [ ] Natural, fluent translation
- [ ] Consistent terminology
- [ ] Appropriate tone (formal/informal)
- [ ] Reasonable length for UI

---

## Need Help?

**Quick Questions:**

1. **"What does this key mean?"**
   → Provide the full key path (e.g., `common.sharing.members.heading`)

2. **"Should this be formal or informal?"**
   → Settings/admin = formal, general UI = friendly

3. **"Is this too long?"**
   → Button labels should be under 15 characters

4. **"Can I rearrange variables?"**
   → Yes! Adjust `{{variables}}` to fit your grammar

5. **"What if there's a typo in English?"**
   → Report it, but translate it accurately anyway

**Contact:**
- Development team: [email]
- GitHub Issues: [link]
- Translator community: [chat platform]

---

## Resources

**JSON Validators:**
- https://jsonlint.com/
- https://jsonformatter.curiousconcept.com/

**Beekeeping Resources:**
- [Local beekeeping association]
- [Beekeeping terminology dictionary]
- [Regional beekeeping forum]

**Translation Tools:**
- Google Translate (for reference only, must review!)
- DeepL (for reference only, must review!)
- Specialized beekeeping dictionaries

---

**Happy Translating! 🐝**

Remember: Quality over speed. It's better to take your time and produce accurate, natural translations than to rush through and create awkward text.

---

**Quick Reference Version:** 1.0  
**Last Updated:** May 2026  
**Companion to:** translator-guide.md
