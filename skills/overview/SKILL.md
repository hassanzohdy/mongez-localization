---
name: mongez-localization-overview
description: |
  High-level architecture of `@mongez/localization` — what it does, what it doesn't, its mental model, and the fallback chain.
  TRIGGER when: code imports `setLocalizationConfigurations`, `extend`, `trans`, `transFrom`, `transObject`, `setCurrentLocaleCode`, `localizationEvents`, `TranslationsList`, or `LocalizationConfigurations` from `@mongez/localization`; user asks "what does @mongez/localization do", "how does the fallback chain work", or "what's the difference between this and @mongez/react-localization"; `import { ... } from "@mongez/localization"`.
  SKIP: `mongez-localization-translations` (registering dictionaries via `extend`/`groupedTranslations`), `mongez-localization-translating` (the `trans` lookup functions), `mongez-localization-interpolation`/`count-translations`/`events`/`recipes` for specific concerns; `@mongez/react-localization` is the React-specific layer on top of this core (`jsxConverter`, `transX`, hooks) — use its skills for JSX placeholders or React hooks.
---

# Overview

`@mongez/localization` is a framework-agnostic i18n primitive. The whole package is a few hundred lines of TypeScript with two dependencies (`@mongez/events`, `@mongez/reinforcements`) and no runtime framework requirement — works in Node, in the browser, with React, Vue, Svelte, vanilla JS, anything.

The React adapter (`jsxConverter`, `transX`) is [`@mongez/react-localization`](https://github.com/hassanzohdy/mongez-react-localization). This core package handles the dictionary, the lookup, the placeholders, the plural rules, and the locale-switching events.

## Install

```sh
yarn add @mongez/localization
# peer: @mongez/events, @mongez/reinforcements
```

## Import pattern

```ts
import {
  setLocalizationConfigurations,
  extend,
  trans,
  transFrom,
  transObject,
  setCurrentLocaleCode,
  localizationEvents,
  type TranslationsList,
  type LocalizationConfigurations,
} from "@mongez/localization";
```

## Mental model

| Concept | Type | Mental model |
|---|---|---|
| Translation dictionary | `TranslationsList = { [locale]: Keywords }` | Map of locale → keyword → string. Keywords may nest. |
| Keyword | `string` | Identifier you ask for at runtime. May use dot-notation to read nested groups. |
| Translatable | `string \| { [locale]: string }` | What `trans` accepts. The object form is for inline per-feature translations. |
| Converter | `(text, placeholders, pattern) => any` | Function that interpolates placeholder values. Default is `plainConverter`; React uses `jsxConverter`. |
| Placeholder pattern | `RegExp` | What the converter matches inside a translation string. Default `:name`. |
| Count rule | `(n: number) => boolean` | Picks one of several `key_<rule>` translations for a `{ count }` placeholder. |
| Event | from `@mongez/events` | The bus the locale-change notifications fire on. |

## Scope boundaries

| Concern | Lives in | Why |
|---|---|---|
| JSX placeholders (`<strong>` as a value) | `@mongez/react-localization` | Keep the core framework-agnostic |
| React hooks for re-rendering on locale change | (not provided) | Use `localizationEvents.onChange` to drive a re-render via local state |
| Persisting the selected locale (cookies, localStorage) | (not provided) | Bring your own — varies per framework |
| ICU MessageFormat / nested message syntax | (not provided) | Out of scope — this package is `name → string + placeholders` |
| Event bus | `@mongez/events` | Shared dependency |
| Object / string utilities (`get`, `set`, `flatten`, `merge`) | `@mongez/reinforcements` | Shared dependency |

## The fallback chain

When `trans(keyword)` runs:

1. Look up `keyword` in the current locale (`getCurrentLocaleCode()` / `getTranslationLocaleCode()`).
2. If missing, look it up in the fallback locale (`getFallbackLocaleCode()`).
3. If still missing, return the keyword itself.

For count-based translations the chain is more elaborate — see `count-translations.md`.

For the inline-object form (`trans({ en: "Home", ar: "الرئيسية" })`), step 1 reads `obj[currentLocale]`, step 2 reads `obj[fallbackLocale]`, step 3 returns the object unchanged (so consumers can detect the miss).
