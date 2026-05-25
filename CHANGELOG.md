# Changelog — @mongez/localization

## Unreleased

### Added

- **`countRanges.ranges`** — declare custom range thresholds as an array of `[min, max]` tuples. `Infinity` as the max renders the suffix as `plus`. If unset, the defaults (`[[0,5], [6,20], [21,Infinity]]`) are used, so existing consumers see no behavior change.
- **`translationLocaleCode`** — correctly-spelled configuration key for the runtime translation locale override. The misspelled `translationLocalCode` still works (read with lower priority) so existing configs keep functioning.
- **README rewrite** in the same marketing-then-reference shape as `@mongez/atom`. Real code, every public export documented, JSX/React story linked out to `@mongez/react-localization` rather than mixed in.
- **AI kit.** `llms.txt`, `llms-full.txt`, and `skills/` (`README`, `overview`, `translations`, `interpolation`, `count-translations`, `events`, `recipes`) for tool-assisted development.
- **Vitest test suite** at `src/__tests__/`. 84 passing tests across the translator core, configuration plumbing, events bus, placeholder interpolation, grouped translations, the `transObject` proxy, count-based translations, and range-based count keys.
- **CI.** GitHub Actions workflow at `.github/workflows/test.yml`: Node 18/20/22 on Ubuntu, plus Node 20 on Windows.
- **`vitest.config.ts`** with a self-detecting sibling-alias resolver: it picks up `@mongez/events` and `@mongez/reinforcements` from the local monorepo when present, and lets the published packages resolve from `node_modules` otherwise. CI runs identically to a fresh consumer install.

### Changed

- **`package.json`**:
  - `description` rewritten to lead with the framework-agnostic, count-rule, and placeholder-interpolation story instead of the generic "i18n handler" line.
  - `sideEffects: false` set so bundlers can tree-shake.
  - `keywords` expanded to cover `internationalization`, `pluralization`, `interpolation`, `framework-agnostic`, and the major framework names users actually search for.
  - `scripts.test` swapped from `jest ./tests` to `vitest run`; `test:watch` swapped to `vitest`. The old `test:coverage`, `test:file`, `fix:test`, `format:test` scripts and their jest/eslint/prettier devDeps were removed.
  - `devDependencies` collapsed to `typescript ^5.4.0` and `vitest ^2.1.0`. The previous jest/ts-jest/eslint stack no longer worked under modern Node — the existing `tests/` folder ran on jest 29 + ts-jest 29, which stopped resolving cleanly under Node 22 in this workspace.

### Fixed

- **Typo in config key.** `LocalizationConfigurations.translationLocalCode` (`src/types.ts:110`) was missing the `e` in "locale". The documented `translationLocaleCode` is now the preferred name and is checked first in `src/translator.ts`. The misspelled `translationLocalCode` continues to work as a fallback for backward compatibility (marked `@deprecated` in `types.ts`).
- **`countRanges.separator` is now respected.** It was read in `src/count-rules.ts:80` but never used to construct the lookup key. The selector now builds the suffix as `_range{separator}{min}{separator}{max}`, defaulting to `_` to preserve current behavior.
- **Range thresholds are now configurable.** The hardcoded buckets in `src/count-rules.ts:83-87` are replaced by `countRanges.ranges` — an array of `[min, max]` tuples. When unset, the previous defaults (`[0,5], [6,20], [21,Infinity]`) are used, so existing consumers see no change.
- **`_range[0-5]` doc references removed.** Only the underscore form `_range_0_5` is implemented. Docs match the implementation.

### Other observations (not introduced here, surfaced during the docs/test pass)

- **Falsy translations bypass.** `transFrom` uses `||` chains on the result of `get(translationsList, …)`, so an intentionally-empty translation (`""`) falls through to the fallback locale and then to the bare keyword. Translations that should legitimately be empty in some locales aren't supported. (`src/translator.ts:235-238` and `:247-251`.)
- **`localizationEvents.onChange` fires even when the value doesn't change.** Calling `setCurrentLocaleCode("en")` while the current locale is already `"en"` still triggers the `localeCode` event. The tests assert the current behavior; whether to dedupe is a design call.
- **Arabic `many` rule cuts off at 99.** Per `src/count-rules.ts:30-33`, `many` matches `mod100` between 11 and 99. The README example ("`count > 10`") and the explicit "many: count > 10" wording in `README.md:846-849` don't match. Counts of 100, 200, 1000 land on `_other`, not `_many`.

### Tests

```
84 passing + 0 skipped = 84 total
```
