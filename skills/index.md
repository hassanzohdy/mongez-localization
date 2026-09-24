---
description: "Framework-agnostic translation runtime: locale codes, keyword tables, placeholders, fallback locale and locale-change events. Exports `trans`, `plainTrans`, `transFrom`, `transObject`, `groupedTranslations`, `extend`, `setTranslationsList`, `setCurrentLocaleCode`, `setFallbackLocaleCode`, `setLocalizationConfigurations`, `localizationEvents`, `setConverter`. Use for: \"translate a key with placeholders\", \"switch language at runtime\", \"add translations for a locale\", \"fallback when a key is missing\", \"pluralise by count\", \"react to locale change\". Not this package: JSX in translations or `transX` in React components → @mongez/react-localization."
---
# @mongez/localization

A global registry of keyword tables per locale. `trans("home.title", { name })` looks up the current locale, then the fallback, and fills placeholders through a converter. It has no UI dependency; @mongez/react-localization builds on it for JSX.

## The 80% path
1. Orient with `overview.md`.
2. Load translations and set locales: `translations.md`.
3. Translate keys and objects: `translating.md`.
4. Placeholders and custom patterns: `interpolation.md`.
5. Plural or count-based text: `count-translations.md`.
6. Reacting to language changes: `events.md`; worked examples: `recipes.md`.

## Conventions and pitfalls
- Set the translations list and current locale before the first `trans` call; a missing key returns the key itself.
- `extend(locale, keywords)` merges into an existing locale, while `setTranslationsList` replaces all of them.
- `plainTrans` always uses the plain converter and returns a string; `trans` may return whatever the converter produces, which is JSX once react-localization's `jsxConverter` is set as the converter.
- `setConverter` is global, so one app has one converter.
- Count rules are configured through `setLocalizationConfigurations`; check `count-translations.md` before adding a locale.
