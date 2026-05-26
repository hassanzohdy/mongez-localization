<div align="center">

# @mongez/localization

**Framework-agnostic i18n primitive — translation dictionaries, placeholder interpolation, count-based plural rules, and locale-switching events.**

[![npm](https://img.shields.io/npm/v/@mongez/localization.svg)](https://www.npmjs.com/package/@mongez/localization)
[![license](https://img.shields.io/npm/l/@mongez/localization.svg)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@mongez/localization.svg)](https://bundlephobia.com/package/@mongez/localization)
[![downloads](https://img.shields.io/npm/dw/@mongez/localization.svg)](https://www.npmjs.com/package/@mongez/localization)

</div>

---

## Why @mongez/localization?

`i18next` is the de-facto answer, but it ships a plugin ecosystem (backends, detectors, post-processors, ICU parsers) and a multi-namespace resolver you usually don't need — and that surface adds bytes and concepts on every project that just wants `trans("home")` to return `"Home"`. The native `Intl.MessageFormat` proposal is closer to the primitive size but isn't shipping in every runtime yet and still leaves you stitching dictionaries, fallbacks, and locale-change events together by hand. `polyglot.js` is the small-and-honest comparison — it has plurals and interpolation, but no events, no inline-object form for per-feature translations, no typed `transObject` proxy, and no swappable converter for JSX values.

`@mongez/localization` is the framework-agnostic core of the Mongez i18n family: a dictionary, a typed reader, placeholders, plurals (English and Arabic built-in, anything pluggable), and a locale-switch event channel. Nothing else.

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

> **The React layer is separate.** JSX placeholder values (`<strong>…</strong>` as a placeholder), the `jsxConverter`, and the `transX` helper live in [`@mongez/react-localization`](https://github.com/hassanzohdy/mongez-react-localization). This package is intentionally framework-free — works in Node, in the browser, with Vue/Svelte/Angular, or wired into the React adapter when you need JSX.

---

## Features

| Feature | Description |
|---|---|
| **Typed dictionary** | `TranslationsList = { [locale]: Keywords }`. Nested keyword groups are read with dot-notation (`trans("ui.sidebar")`). |
| **`trans` / `transFrom`** | Read against the current locale, or against an explicit locale. Same fallback chain in both. |
| **Inline translation objects** | `trans({ en: "Home", ar: "الرئيسية" })` — pass the translation object itself when you want per-feature literals next to the component. |
| **Placeholder interpolation** | Default `:name` syntax. Switch to `{{name}}` or any RegExp via `placeholderPattern`. Unmatched placeholders survive in the output so missing slots are visible. |
| **Count-based plurals** | Suffix keys with `_zero`/`_one`/`_two`/`_three`/`_many`/`_negative`/`_other` and pass `{ count: n }`. Built-in rule packs for English and Arabic; bring your own via `countRules`. |
| **Range-based count buckets** | Opt-in `countRanges` for `0–5` / `6–20` / `21+` style buckets with `_range_<min>_<max>` suffixes (or `_range_<min>_plus` for open-ended). |
| **Locale-switch events** | `localizationEvents.onChange("localeCode" \| "fallback", cb)` — drive cookie/URL persistence, framework re-renders, analytics. |
| **Typed `transObject` proxy** | `transObject(dict)` returns a Proxy where direct reads return the current-locale string and `.p(key, ...)` interpolates. |
| **`extend` merges, `setTranslationsList` replaces** | Two patterns for two different needs — feature-file growth vs. boot-time bulk load. |
| **Swappable converter** | Default `plainConverter` produces strings. Swap it for `jsxConverter` (from `@mongez/react-localization`) to interpolate JSX nodes. |
| **Tiny core** | Two dependencies (`@mongez/events`, `@mongez/reinforcements`), no peer framework, `sideEffects: false`. |

---

## Installation

```sh
npm install @mongez/localization
```

```sh
yarn add @mongez/localization
```

```sh
pnpm add @mongez/localization
```

`@mongez/events` and `@mongez/reinforcements` install automatically as runtime dependencies.

---

## Quick start

```ts
import {
  setLocalizationConfigurations,
  extend,
  trans,
  setCurrentLocaleCode,
} from "@mongez/localization";

// 1. Configure once at boot.
setLocalizationConfigurations({
  defaultLocaleCode: "en",
  fallback: "en",
});

// 2. Register translations. Multiple `extend` calls for the same locale merge.
extend("en", {
  home:        "Home",
  contact:     "Contact Us",
  greet:       "Hello :name",
  createItem:  "Create New :item",
});

extend("ar", {
  home:  "الرئيسية",
  greet: "مرحبا :name",
});

// 3. Read.
trans("home");                          // "Home"
trans("greet", { name: "Ada" });        // "Hello Ada"
trans("createItem", { item: "Order" }); // "Create New Order"

// 4. Switch locales at runtime.
setCurrentLocaleCode("ar");
trans("home");                          // "الرئيسية"
trans("contact");                       // "Contact Us"  — falls back to en
trans("never-defined");                 // "never-defined"  — final fallback is the key itself
```

That's the whole happy path. Every section below is depth on the same surface.

---

## Configuration

`setLocalizationConfigurations(options)` is the only initialization step. It merges into the stored config and applies side effects for the supplied keys.

```ts
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  defaultLocaleCode: "en",                  // initial current locale (also fires `localeCode` event)
  fallback: "en",                            // initial fallback locale (also fires `fallback` event)
  translations: { en: { home: "Home" } },    // bulk-seed all locales upfront (full replace)
  placeholderPattern: "doubleCurly",         // "colon" | "doubleCurly" | RegExp
  // converter: jsxConverter,                // installed via setConverter under the hood
  // countRules: { fr: { ... } },            // override built-in plural rules per locale
});
```

| Option | Default | Effect |
|---|---|---|
| `defaultLocaleCode` | `"en"` | Initial current locale. Calls `setCurrentLocaleCode`, fires the `localeCode` event. |
| `fallback` | `"en"` | Initial fallback locale. Calls `setFallbackLocaleCode`, fires the `fallback` event. |
| `translations` | `{}` | Bulk-load every locale. Replaces any existing dictionary — not a merge. |
| `converter` | `plainConverter` | Replace the placeholder converter (e.g. install `jsxConverter`). |
| `placeholderPattern` | `"colon"` (`/:(\w+)/g`) | One of `"colon"`, `"doubleCurly"`, or a custom RegExp. |
| `countRules` | English + Arabic packs | Per-locale plural rules. See [count-based translations](#count-based-translations). |
| `countRanges` | disabled | Enable range-based bucket suffixes. See [range-based count buckets](#range-based-count-buckets). |
| `translationLocaleCode` | unset | Optional runtime override for what `trans` resolves the current locale to. |

> **`translationLocalCode` (without the `e`) still works.** The misspelled key was preserved for backward compatibility and is marked `@deprecated`. When both are set, the correctly-spelled `translationLocaleCode` wins. Migrate when convenient.

`getLocalizationConfigurations()` returns the full merged config. `getLocaleConfig(key, default?)` reads a single key.

---

## Registering translations

### `extend(localeCode, keywords)` — merge into one locale

The idiomatic pattern for splitting a locale across feature files. Repeated calls for the same locale merge into the existing keyword bag.

```ts
import { extend } from "@mongez/localization";

extend("en", { home: "Home" });
extend("en", { contact: "Contact Us" });
// → en now holds { home: "Home", contact: "Contact Us" }
```

Nested keyword objects are supported — and read back with dot-notation:

```ts
extend("en", {
  ui: {
    home: "Home",
    sidebar: "Sidebar",
  },
});

trans("ui.home");      // "Home"
trans("ui.sidebar");   // "Sidebar"
```

### `groupedTranslations(groupKey?, dict)` — keyword-first declaration

When each keyword carries every locale next to it, use `groupedTranslations`. Internally it flattens the input and pushes each leaf into the right locale's bag.

```ts
import { groupedTranslations, trans } from "@mongez/localization";

groupedTranslations({
  home:    { en: "Home",       ar: "الرئيسية" },
  contact: { en: "Contact Us", ar: "اتصل بنا" },
});

trans("home");         // "Home"
```

Pass a group key first to namespace the whole batch under a prefix:

```ts
groupedTranslations("store", {
  orders:   { en: "Orders",   ar: "الطلبات" },
  products: { en: "Products", ar: "المنتجات" },
});

trans("store.orders"); // "Orders"
```

Nested groups work too:

```ts
groupedTranslations({
  general: {
    home: { en: "Home", ar: "الرئيسية" },
  },
});

trans("general.home"); // "Home"
```

### `setTranslationsList(map)` — full replace

`extend` merges; `setTranslationsList` replaces the entire dictionary in one call. Reach for it on boot when you load the full dictionary from JSON or an API.

```ts
import { setTranslationsList, getTranslationsList, getKeywordsListOf } from "@mongez/localization";

setTranslationsList({
  en: { home: "Home", contact: "Contact Us" },
  ar: { home: "الرئيسية" },
});

getTranslationsList();      // full TranslationsList
getKeywordsListOf("en");    // { home: "Home", contact: "Contact Us" }
getKeywordsListOf("klingon"); // null
```

---

## Reading translations

```ts
import { trans, transFrom, plainTrans } from "@mongez/localization";

trans("home");                     // current locale
transFrom("ar", "home");           // explicit locale
plainTrans("home", { name: "Ada" }); // ignores the configured converter, uses plainConverter
```

| Function | When to reach for it |
|---|---|
| `trans(keyword, placeholders?)` | The default reader. Uses the current locale and the configured converter. |
| `transFrom(locale, keyword, placeholders?)` | When you need a specific locale (e.g. emails, server-rendered strings, exports). |
| `plainTrans(keyword, placeholders?)` | When the global converter is `jsxConverter` but you need a plain string at one call site (logs, attribute values). |

The fallback chain for a plain string keyword: **current locale → fallback locale → keyword itself.** Missing keys never throw — they return the bare keyword so absent translations are visible in the UI.

```ts
extend("en", { home: "Home" });
setCurrentLocaleCode("ar");
setFallbackLocaleCode("en");

trans("home");          // "Home"           — fallback to en
trans("never-defined"); // "never-defined"  — final fallback is the key
```

### Inline translation objects

Both `trans` and `transFrom` accept the translation object directly as the keyword. This is the pattern for per-feature translations declared next to the component that uses them.

```ts
const welcome = { en: "Welcome", ar: "مرحبا" };

trans(welcome);                  // current-locale value
transFrom("ar", welcome);        // "مرحبا"
```

For inline objects, the fallback when the requested locale is missing is `fallbackLocaleCode` — and if that's missing too, the object itself is returned (so consumers can detect the miss).

> **Empty translations bypass the fallback intentionally — but it bites.** `transFrom` chains `||` over the dictionary lookups, so an intentionally-empty string (`""`) in one locale falls through to the fallback chain. If you legitimately want a locale to render nothing, store a sentinel (`" "` or a marker) and post-process at the call site.

---

## Placeholders and converters

Default pattern is colon-prefixed (`:name`). Switch globally via `placeholderPattern`:

```ts
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  placeholderPattern: "doubleCurly",   // "colon" | "doubleCurly" | RegExp
});

extend("en", { hi: "Hello {{name}}" });
trans("hi", { name: "Ada" });          // "Hello Ada"
```

A placeholder with no matching value in the passed object is left intact, so you can compose strings incrementally and still see un-filled slots in the UI:

```ts
extend("en", { invite: "Hi :name, :inviter sent you a code" });
trans("invite", { name: "Ada" });      // "Hi Ada, :inviter sent you a code"
```

> **The converter only runs when placeholders are passed.** `trans("home")` returns the raw translation string with zero conversion overhead. The cost only kicks in when there's a placeholders object to interpolate.

### Custom converters

A converter receives the resolved translation, the placeholders object, and the active RegExp. The default `plainConverter` returns a string; React's `jsxConverter` returns an array of nodes — return type isn't constrained.

```ts
import { setConverter, type Converter } from "@mongez/localization";

const upperConverter: Converter = (text, placeholders, pattern) => {
  return text.replace(pattern, (_, key) => String(placeholders[key] ?? "").toUpperCase());
};

setConverter(upperConverter);
trans("greet", { name: "Ada" });       // "Hello ADA"
```

---

## Count-based translations

Suffix a keyword with one of `_zero` / `_one` / `_two` / `_three` / `_many` / `_negative` / `_other` and pass `{ count: n }`. The selector picks the right variant from the current locale's count rules.

```ts
extend("en", {
  products_zero:  "No products",
  products_one:   "One product",
  products_two:   "A pair of products",
  products_three: "A trio of products",
  products_many:  "Many products (:count in stock)",
  products_other: ":count products",
});

trans("products", { count: 0 });   // "No products"
trans("products", { count: 1 });   // "One product"
trans("products", { count: 4 });   // "Many products (4 in stock)"
```

The selector chain for count lookups is more elaborate than the plain chain:

1. Current locale + count-rule suffix (e.g. `en.products_many`)
2. Fallback locale + count-rule suffix (using the fallback's own rules)
3. Current locale + `_other`
4. Fallback locale + `_other`
5. Current locale + bare keyword
6. Fallback locale + bare keyword
7. The keyword string itself

Partial translation packs degrade gracefully — you can ship just `_one` and `_other` in a new locale and counts > 1 land on `_other`.

`:count` is interpolated as the **absolute** value, so a `count: -5` lookup that picks `_negative` displays `5` (not `-5`). Use the suffix to phrase the negative case (`"Overdrawn by :count"`).

### Built-in rule packs

| Locale | Rules |
|---|---|
| `en` | `negative` (n < 0), `zero` (n === 0), `one` (n === 1), `two` (n === 2), `three` (n === 3), `many` (n > 3), `other` (catch-all) |
| `ar` | `negative` (n < 0), `zero` (n === 0), `one` (n === 1), `two` (n === 2), `few` (`abs(n) % 100` in `[3, 10]`), `many` (`abs(n) % 100` in `[11, 99]`), `other` (catch-all) |

> **Arabic `many` cuts off at 99.** Per the built-in rule, `abs(n) % 100` must be in `[11, 99]` — so counts like `100`, `200`, `1000` land on `_other`, not `_many`. If your translations need to cover `100+` under a single phrase, override the `ar` rules below or add an `_other` entry that reads naturally for large counts.

### Custom rules per locale

```ts
setLocalizationConfigurations({
  countRules: {
    fr: {
      one:   n => n === 0 || n === 1,   // French treats 0 and 1 as singular
      other: () => true,
    },
    pl: {
      one:   n => n === 1,
      few:   n => n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20),
      many:  n => n !== 1 && (n % 10 < 2 || n % 10 > 4 || (n % 100 >= 10 && n % 100 < 20)),
      other: () => true,
    },
  },
});
```

A rule object is `{ [ruleName]: (count: number) => boolean }`. The selector iterates the entries in order and picks the first match — so put the most-specific rule (e.g. `zero`) before the catch-all (`other`).

### Range-based count buckets

For UX patterns like "1–5", "6–20", "21+", flip on `countRanges.enabled` and key your translations as `_range_<min>_<max>` (or `_range_<min>_plus` for the open-ended bucket).

```ts
setLocalizationConfigurations({
  countRanges: {
    enabled: true,
    // Optional. Defaults to [[0, 5], [6, 20], [21, Infinity]].
    ranges: [
      [0, 5],
      [6, 20],
      [21, Infinity],
    ],
  },
});

extend("en", {
  reviews_range_0_5:    "Just a few reviews (:count)",
  reviews_range_6_20:   "A handful of reviews (:count)",
  reviews_range_21_plus: "Tons of reviews (:count+)",
});

trans("reviews", { count: 3 });    // "Just a few reviews (3)"
trans("reviews", { count: 12 });   // "A handful of reviews (12)"
trans("reviews", { count: 250 });  // "Tons of reviews (250+)"
```

The separator defaults to `_` and is configurable via `countRanges.separator` if you need a different key shape.

---

## `transObject` — typed property reads

`transObject(dict)` returns a `Proxy` over your dictionary. Direct property reads return the current-locale translation; `.p(key, placeholders)` interpolates via the active converter; `.plain(key, placeholders)` forces `plainConverter`.

```ts
import { transObject } from "@mongez/localization";

const t = transObject({
  name:    { en: "name",    ar: "الاسم" },
  welcome: { en: "Hi :who", ar: "مرحبا :who" },
});

t.name;                              // current-locale value
t.p("welcome", { who: "Ada" });      // "Hi Ada" via the configured converter
t.plain("welcome", { who: "Ada" });  // "Hi Ada" forced through plainConverter
```

TypeScript preserves the dict's keys: `t.name` and `t.welcome` are typed as `string`, and `t.p("welcome", …)` typechecks the key.

> **`p` and `plain` are reserved keys.** If your dictionary declares a key named `p` or `plain`, the proxy's method shadows it — the dictionary value becomes unreachable through the proxy. Rename the dictionary key.

Unknown proxy reads fall through to a global `transFrom(fallbackLocaleCode, key)` lookup, so reading `t.somethingElse` resolves against the global dictionary under the fallback locale. This lets you mix per-feature `transObject` dictionaries with globally-registered keywords on the same identifier.

---

## Locale switching with events

```ts
import {
  localizationEvents,
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  getCurrentLocaleCode,
  getFallbackLocaleCode,
} from "@mongez/localization";

const sub = localizationEvents.onChange("localeCode", (next, prev) => {
  console.log(`Locale changed: ${prev} → ${next}`);
});

setCurrentLocaleCode("ar");  // logs "Locale changed: en → ar"
getCurrentLocaleCode();      // "ar"

sub.unsubscribe();           // stop listening
```

The same channel exists for the fallback locale:

```ts
localizationEvents.onChange("fallback", (next, prev) => {
  // ...
});

setFallbackLocaleCode("en");
getFallbackLocaleCode();     // "en"
```

Under the hood, events ride the `@mongez/events` bus at `localization.change.localeCode` and `localization.change.fallback` — you can subscribe with raw `events.subscribe(...)` if you need to.

> **Events fire on every set call.** `setCurrentLocaleCode("en")` while the locale is already `"en"` still triggers the `localeCode` event. The package does not dedupe — subscribers that care about real transitions should compare `next` and `prev` themselves.

---

## Recipes

### Lazy-load a locale's dictionary

Reach for this when most users only ever see one locale and you don't want to ship every translation in the initial bundle.

```ts
import { extend, setCurrentLocaleCode } from "@mongez/localization";

const loaders: Record<string, () => Promise<Record<string, string>>> = {
  ar: () => import("./locales/ar.json").then(m => m.default),
  fr: () => import("./locales/fr.json").then(m => m.default),
};

export async function switchLocale(code: string) {
  if (loaders[code]) {
    const dict = await loaders[code]();
    extend(code, dict);          // merge into whatever's already loaded
  }
  setCurrentLocaleCode(code);
}
```

The bundler caches the dynamic import, so repeated calls to `switchLocale("ar")` only fetch once.

### Pluralize correctly across English and Arabic

Reach for this when the same keyword needs to read naturally in both languages and the count drives the wording. Arabic has more grammatical number forms than English, so a one-size-fits-all `_other` isn't enough.

```ts
extend("en", {
  apple_zero:  "No apples",
  apple_one:   "One apple",
  apple_two:   "Two apples",
  apple_many:  ":count apples",
  apple_other: ":count apples",
});

extend("ar", {
  apple_zero:  "لا يوجد تفاح",
  apple_one:   "تفاحة واحدة",
  apple_two:   "تفاحتان",
  apple_few:   ":count تفاحات",   // 3-10 mod 100
  apple_many:  ":count تفاحة",     // 11-99 mod 100
  apple_other: ":count تفاحة",     // catch-all (covers 100+)
});

trans("apple", { count: 1 });    // English: "One apple"
trans("apple", { count: 5 });    // English: "5 apples" (from _many)

setCurrentLocaleCode("ar");
trans("apple", { count: 1 });    // "تفاحة واحدة"
trans("apple", { count: 5 });    // "5 تفاحات" (from _few)
trans("apple", { count: 15 });   // "15 تفاحة" (from _many)
trans("apple", { count: 100 });  // "100 تفاحة" (from _other — _many cuts off at 99)
```

### Persist the locale in a cookie

Reach for this when you want the user's choice to survive page reloads and to be available server-side (SSR) on the next request.

```ts
import { localizationEvents, setCurrentLocaleCode } from "@mongez/localization";

// On boot: read the cookie and apply.
const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
if (match) {
  setCurrentLocaleCode(decodeURIComponent(match[1]));
}

// On every locale switch: write back.
localizationEvents.onChange("localeCode", (next) => {
  document.cookie = `locale=${encodeURIComponent(next)};path=/;max-age=31536000;samesite=lax`;
});
```

For SSR, parse the same cookie from the request header on the server, call `setCurrentLocaleCode(value)` before rendering, and the browser-side handler keeps writing it on subsequent switches.

### Sync the URL `?lang=` with the active locale

Reach for this when you want shareable links (`/page?lang=ar`) to deep-link into a specific locale.

```ts
import { localizationEvents, setCurrentLocaleCode } from "@mongez/localization";

// On boot: read from URL.
const fromQuery = new URL(window.location.href).searchParams.get("lang");
if (fromQuery) setCurrentLocaleCode(fromQuery);

// On switch: write back to URL without a navigation.
localizationEvents.onChange("localeCode", (next) => {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", next);
  window.history.replaceState({}, "", url);
});
```

### Build a typed per-feature dictionary

Reach for this when a feature owns its own translations and you want autocomplete on the keys at the call site (instead of stringly-typed `trans("auth.signIn")` calls).

```ts
// src/features/auth/translations.ts
import { transObject } from "@mongez/localization";

export const t = transObject({
  signIn:      { en: "Sign In",       ar: "تسجيل الدخول" },
  signOut:     { en: "Sign Out",      ar: "تسجيل الخروج" },
  welcomeBack: { en: "Welcome :name", ar: "مرحبا :name" },
});
```

```tsx
// src/features/auth/UserMenu.tsx
import { t } from "./translations";

function UserMenu({ user }: { user: { name: string } }) {
  return (
    <>
      <h2>{t.p("welcomeBack", { name: user.name })}</h2>
      <button>{t.signOut}</button>
    </>
  );
}
```

`t.signOut` is typed as `string`, and `t.p("welcomeBack", …)` typechecks the key against the dict you declared. Mix with globally-extended keywords — unknown reads on the proxy fall through to the global dictionary.

### Drive React re-renders on locale change without the React adapter

Reach for this when you're on React but don't (yet) want the full `@mongez/react-localization` install. A tiny hook subscribes to the locale-change event and forces re-renders by updating local state.

```ts
// src/hooks/useCurrentLocale.ts
import { useEffect, useState } from "react";
import { getCurrentLocaleCode, localizationEvents } from "@mongez/localization";

export function useCurrentLocale() {
  const [locale, setLocale] = useState(getCurrentLocaleCode);
  useEffect(() => {
    const sub = localizationEvents.onChange("localeCode", (next, prev) => {
      if (next !== prev) setLocale(next);  // dedupe — events fire on every set
    });
    return () => sub.unsubscribe();
  }, []);
  return locale;
}
```

```tsx
function Header() {
  useCurrentLocale();                  // subscribe; ignore the return
  return <h1>{trans("home")}</h1>;     // re-renders on locale change
}
```

For JSX placeholder values (`<strong>`, `<Link>`, anything React), reach for [`@mongez/react-localization`](https://github.com/hassanzohdy/mongez-react-localization) — its `jsxConverter` and `transX` cover the cases plain string converters can't.

### Bulk-load translations from JSON

Reach for this when your translations live in JSON files (or are fetched from a CMS) and you want to drop them in wholesale at boot.

```ts
import { setLocalizationConfigurations } from "@mongez/localization";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

setLocalizationConfigurations({
  defaultLocaleCode: "en",
  fallback: "en",
  translations: { en, ar },     // bulk-seed (replaces any existing dictionary)
});
```

If you need to add more keys later (e.g. lazy-loaded feature translations), keep using `extend(localeCode, keywords)` — it merges into the existing bag.

---

## TypeScript

Every public surface is typed. Imports from the package root:

```ts
import type {
  TranslationsList,
  Keywords,
  Translatable,
  Converter,
  LocalizationConfigurations,
  LocaleCodeChangeCallback,
  LocalizationEventName,
  CountRuleFunction,
  LanguageCountRules,
  CountRulesConfig,
  GroupedTranslations,
  WithPlaceholder,
} from "@mongez/localization";
```

Key shapes:

```ts
type TranslationsList = { [localeCode: string]: Keywords };
type Keywords         = { [key: string]: string | Keywords };
type Translatable     = string | { [localeCode: string]: string };

type Converter = (
  translation: string,
  placeholders: any,
  placeholderPattern: RegExp,
) => any;

type CountRuleFunction = (count: number) => boolean;
type LanguageCountRules = { [ruleName: string]: CountRuleFunction };
```

`transObject<T>(dict)` preserves the keys of `T` as a string-typed surface plus the `p` and `plain` helpers.

---

## Related packages

| Package | Use when you need |
|---|---|
| [`@mongez/react-localization`](https://github.com/hassanzohdy/mongez-react-localization) | JSX-aware placeholders (`<strong>` as a value), `jsxConverter`, `transX`, and React hooks/components on top of this core. |
| [`@mongez/events`](https://github.com/hassanzohdy/events) | The underlying event bus. Listen to `localization.change.localeCode` / `.fallback` directly if you need to bypass the typed wrapper. |
| [`@mongez/reinforcements`](https://github.com/hassanzohdy/reinforcements) | TypeScript utility belt (`get`, `set`, `flatten`, `merge`) used internally for nested-keyword reads and grouped-translation flattening. |

---

## Further reading

- [`CHANGELOG.md`](./CHANGELOG.md) — release notes, including documented gotchas (empty-translation bypass, Arabic `many` cutoff, event de-dupe behavior).
- [`llms-full.txt`](./llms-full.txt) — exhaustive single-file API surface for tool-assisted development.
- [`skills/`](./skills) — per-topic deep dives (overview, translations, translating, interpolation, count translations, events, recipes).

---

## License

MIT
