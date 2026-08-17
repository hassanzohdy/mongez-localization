# Changelog — @mongez/localization

## [3.4.7] — 2026-08-17

Maintenance release. No code changes and no behaviour change — this pins an existing safety property so a future refactor can't quietly remove it.

### Added

- **Prototype-pollution regression test** (`src/__tests__/prototype-pollution.test.ts`). Translation keys are caller-supplied strings that get walked as nested paths, which is the exact shape that produces a prototype-pollution bug elsewhere in this family — so the property is worth asserting rather than assuming. The test covers the registry writers: a `JSON.parse`'d `__proto__` key passed to `extend()`, and `__proto__` / `constructor.prototype` keys passed to `groupedTranslations()`, each asserted to leave `Object.prototype` untouched. It passes against the current implementation; it exists so that if the key-walking logic is ever rewritten, the failure shows up here instead of in a consuming app.

## [3.4.6] — 2026-05-26

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

### Tests

```
84 passing + 0 skipped = 84 total
```
