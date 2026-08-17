---
name: mongez-localization-overview
description: |
  @mongez/localization — framework-agnostic i18n primitive. Translation dictionaries, placeholder interpolation, count-based plural rules, locale switching events. Two deps, works anywhere.
---

# @mongez/localization — Overview

Framework-agnostic i18n in a few hundred lines of TypeScript. Translation dictionaries, placeholder interpolation, count-based plural rules, locale-switching events — all from one core. Works in Node, browser, with React, Vue, Svelte, vanilla JS. For React JSX placeholders (`<strong>` as a translation value), pair with [`@mongez/react-localization`](/react-localization/overview/).

## Highlighted features

<div class="mongez-highlights">

<div class="mongez-highlight" data-accent="ice">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  <h3>Per-locale dictionaries</h3>
  <p><code>extend("en", {...})</code>, <code>extend("ar", {...})</code> — flat or nested keyword maps, registered any time. Switch with <code>setCurrentLocaleCode</code>.</p>
</div>

<div class="mongez-highlight" data-accent="ice">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
  <h3>Placeholder interpolation</h3>
  <p><code>trans("greet", { name: "Ada" })</code> with default <code>:name</code> pattern, or a custom regex via configuration. Pluggable converter for non-string output.</p>
</div>

<div class="mongez-highlight" data-accent="fire">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  <h3>Count-based plurals</h3>
  <p>Custom <code>countRules</code> pick from <code>key_zero</code>, <code>key_one</code>, <code>key_many</code> when a <code>count</code> placeholder is present. Locale-specific rules supported.</p>
</div>

<div class="mongez-highlight" data-accent="bolt">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  <h3>Fallback chain</h3>
  <p>Missing in current locale → look in fallback locale → return keyword itself. Inline-object form returns the object on full miss so consumers can detect it.</p>
</div>

<div class="mongez-highlight" data-accent="bolt">
  <svg class="mongez-highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  <h3>Locale-switching events</h3>
  <p><code>localizationEvents.onChange(cb)</code> fires when the current locale flips — drive re-renders, persist the choice, update an HTML lang attribute.</p>
</div>

</div>

## Install

```sh
npm install @mongez/localization
# or: yarn add @mongez/localization
# or: pnpm add @mongez/localization
```

`@mongez/events` and `@mongez/reinforcements` install automatically as runtime deps.

## Quick peek

```ts
import { setLocalizationConfigurations, extend, trans, setCurrentLocaleCode } from "@mongez/localization";

setLocalizationConfigurations({ defaultLocaleCode: "en", fallback: "en" });

extend("en", { home: "Home", greet: "Hello :name" });
extend("ar", { home: "الرئيسية", greet: "مرحبا :name" });

trans("home");                     // "Home"
trans("greet", { name: "Ada" });   // "Hello Ada"

setCurrentLocaleCode("ar");
trans("home");                     // "الرئيسية"
```

Configure once at boot, register dictionaries per locale, read by keyword. Switching the current locale flips every subsequent `trans()` call.

## Mental model

| Concept | Mental model |
|---|---|
| Translation dictionary | `{ [locale]: Keywords }`. Keywords may nest. |
| Keyword | Identifier you ask for at runtime. May use dot-notation to read nested groups. |
| Translatable | `string` or `{ [locale]: string }`. The object form is for inline per-feature translations. |
| Converter | Function that interpolates placeholder values. Default `plainConverter`; React uses `jsxConverter`. |
| Placeholder pattern | Regex matched inside translation strings. Default `:name`. |
| Count rule | `(n: number) => boolean`. Picks one of several `key_<rule>` translations for a `{ count }` placeholder. |

## The fallback chain

When `trans(keyword)` runs:

1. Look up `keyword` in the current locale.
2. If missing, look in the fallback locale.
3. If still missing, return the keyword itself.

For the inline-object form (`trans({ en: "Home", ar: "..." })`), step 1 reads `obj[currentLocale]`, step 2 reads `obj[fallbackLocale]`, step 3 returns the object unchanged so consumers can detect the miss.

## Scope boundaries

| Concern | Lives in | Why |
|---|---|---|
| JSX placeholders (`<strong>` as a value) | [`@mongez/react-localization`](/react-localization/overview/) | Keep the core framework-agnostic |
| React hooks for re-rendering on locale change | (not provided) | Use `localizationEvents.onChange` to drive a re-render via local state |
| Persisting the selected locale | (not provided) | Bring your own — varies per framework |
| ICU MessageFormat / nested message syntax | (not provided) | Out of scope — this package is `name → string + placeholders` |

## Where to go next

- **[Translations](../translations/)** — `extend`, dictionary shapes, registration patterns
- **[Translating](../translating/)** — `trans`, `transFrom`, `transObject`
- **[Interpolation](../interpolation/)** — placeholder patterns, custom converters
- **[Count translations](../count-translations/)** — plural rules, fallback chain
- **[Events](../events/)** — `localizationEvents`, locale-change hooks
- **[Recipes](../recipes/)** — common patterns
