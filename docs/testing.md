# Testing Guide — prelegal

## Automated Tests

### Unit + Integration (Jest)

```bash
cd frontend
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

Tests live in `frontend/__tests__/` and cover:

| File | What is tested |
|---|---|
| `lib/nda-template.test.ts` | `buildStandardTerms()`: placeholder replacement, term branching, pluralisation, empty-field fallbacks |
| `components/NDAPreview.test.tsx` | CoverPage and StandardTerms rendering: filled vs. placeholder fields, date formatting, term type branching, signature block |
| `components/NDAForm.test.tsx` | All form inputs, radio toggle behaviour, party field update propagation |
| `components/NDACreator.test.tsx` | State initialisation, form → preview reactivity, print button |

### End-to-End (Playwright)

```bash
cd frontend
npm run test:e2e              # headless Chromium
npm run test:e2e:ui           # Playwright UI mode (interactive)
npx playwright install        # first-time: install browsers
```

E2E tests require the dev server or prod build. The `playwright.config.ts` starts the dev server automatically when tests run.

---

## Manual Test Plan

Run this checklist before merging any changes to the NDA creator.

### 1. Page load

| # | Step | Expected |
|---|---|---|
| 1.1 | Open `http://localhost:3000` | App loads without console errors |
| 1.2 | Inspect fonts | Geist Sans renders for body text |
| 1.3 | Check header | "Mutual NDA Creator" heading and "Download PDF" button visible |
| 1.4 | Check layout | Form panel on left (~384 px wide), preview on right |
| 1.5 | Resize window to 1280 × 800 | No layout overflow or scroll bar appears unexpectedly |

### 2. Form → Preview live update

| # | Step | Expected |
|---|---|---|
| 2.1 | Clear the Purpose textarea | Preview shows italic grey placeholder text |
| 2.2 | Type "Testing a new partnership" in Purpose | Indigo-highlighted text appears in preview cover page **and** standard terms (3 locations) |
| 2.3 | Change Effective Date to a past date (e.g. 2020-03-15) | Preview cover page shows "March 15, 2020" (US long-form, correct timezone — not March 14) |
| 2.4 | Set Governing Law to "California" | Cover page shows "California"; standard terms clause 9 shows "California" twice |
| 2.5 | Set Jurisdiction to "San Francisco, CA" | Cover page shows "San Francisco, CA"; clause 9 shows it twice |
| 2.6 | Fill all Party 1 fields | Signature block on cover page updates in real time |
| 2.7 | Fill all Party 2 fields | Second signature block updates |

### 3. MNDA Term

| # | Step | Expected |
|---|---|---|
| 3.1 | Default state | "Expires after a fixed number of years" radio selected; year input shows "1"; cover page shows "1 year from Effective Date" |
| 3.2 | Change years to 2 | Cover page shows "2 years from Effective Date" |
| 3.3 | Change years to 1 | Cover page shows "1 year from Effective Date" (singular, no "s") |
| 3.4 | Select "Continues until terminated" | Year input disappears; cover page shows "Until terminated" |
| 3.5 | Select "Expires" again | Year input reappears with previously entered value preserved |

### 4. Term of Confidentiality

| # | Step | Expected |
|---|---|---|
| 4.1 | Default state | "Fixed number of years" selected; cover page shows "1 year from Effective Date" |
| 4.2 | Change years to 5 | Cover page shows "5 years from Effective Date" |
| 4.3 | Select "In perpetuity" | Year input disappears; cover page shows "In perpetuity" |
| 4.4 | Select "Fixed" again | Year input reappears with previously entered value |

### 5. PDF / Print output

> Print dialog must be triggered before running this section. Use Ctrl+P / Cmd+P or click "Download PDF".

| # | Step | Expected |
|---|---|---|
| 5.1 | Open print preview | Form sidebar and header are hidden; only the NDA document is visible |
| 5.2 | Check page count | Cover page on page 1; standard terms start on page 2 (page break after cover) |
| 5.3 | Check cover page | All filled fields appear in indigo; unfilled fields appear in grey italic |
| 5.4 | Check standard terms | All field replacements show correct values from form |
| 5.5 | Check signature block | "Signature" row is a blank underline (no printed text) |
| 5.6 | Save as PDF and open in PDF viewer | Text is selectable; fonts render correctly |
| 5.7 | Verify CC BY 4.0 footer | Appears at the bottom of the cover page only |

### 6. Cross-browser

| Browser | Version | Status |
|---|---|---|
| Chrome | latest | ☐ |
| Firefox | latest | ☐ |
| Safari | 16.4+ | ☐ |
| Edge | latest | ☐ |

Test steps 1–5 in each browser. Note any rendering differences, especially:
- Font loading (Geist from Google Fonts CDN)
- Print dialog behaviour and PDF output layout
- Date display (timezone handling)

### 7. Edge cases

| # | Step | Expected |
|---|---|---|
| 7.1 | Leave all fields empty, open print preview | Every field shows a grey italic placeholder, not an empty space |
| 7.2 | Enter a very long purpose (500+ characters) | Form and preview handle long text without layout breaks |
| 7.3 | Enter special characters in fields (e.g. `<>&"'`) | No XSS; characters render as literal text, not HTML |
| 7.4 | Open app, leave tab open overnight, refresh | App resets to defaults (no state persistence is expected) |
| 7.5 | Set mndaTermYears to 0 via browser devtools | Cover page shows "1 year" (clamped by Math.max guard); standard terms may show "0 years" (known inconsistency) |

---

## Known Issues

| Issue | Location | Severity |
|---|---|---|
| Empty `mndaTermYears` produces `" years from Effective Date"` (missing number) in standard terms | `nda-template.ts:35` | Low — field defaults to "1", user must manually clear |
| Standard terms do not guard against `mndaTermYears = "0"` unlike CoverPage | `nda-template.ts:35` vs `NDAPreview.tsx:36` | Low |
| No state persistence across page refresh | By design | N/A |
