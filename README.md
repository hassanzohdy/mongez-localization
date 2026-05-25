# @mongez/localization

> A framework-agnostic i18n primitive. Translation dictionaries with placeholder interpolation, count-based plural rules, locale-switching events, and a typed `transObject` proxy — all in a few hundred lines of TypeScript with two tiny dependencies.

`@mongez/localization` is the core of the Mongez i18n family. The React adapter — `jsxConverter`, `transX` — lives in [`@mongez/react-localization`](https://github.com/hassanzohdy/mongez-react-localization).

Every export ships from the package root. No subpaths, no init step beyond `setLocalizationConfigurations`.

## Install

```sh
yarn add @mongez/localization
# peer deps: @mongez/events, @mongez/reinforcements
```

## A 30-second tour

```ts
import {
  setLocalizationConfigurations,
  extend,
  trans,
  setCurrentLocaleCode,
  localizationEvents,
} from "@mongez/localization";

// 1. Tell the package which locale you're starting in, what to fall back
//    to, and (optionally) seed every translation upfront.
setLocalizationConfigurations({
  defaultLocaleCode: "en",
  fallback: "en",
});

// 2. Register translations. Multiple `extend` calls for the same locale
//    merge — keep one file per locale if you like.
extend("en", {
  home: "Home",
  contact: "Contact Us",
  createItem: "Create New :item",
});
extend("ar", {
  home: "الرئيسية",
});

// 3. Read.
trans("home");                         // "Home"
trans("createItem", { item: "Order" }); // "Create New Order"

// 4. Switch locales at runtime. Anything subscribed via
//    `localizationEvents.onChange("localeCode", ...)` fires.
setCurrentLocaleCode("ar");
trans("home");                          // "الرئيسية"
trans("contact");                       // "Contact Us"  (fallback to en)
```

## What's in the box

| Export | Purpose |
|---|---|
| `setLocalizationConfigurations` / `getLocalizationConfigurations` / `getLocaleConfig` | Configure default locale, fallback, converter, placeholder pattern, count rules. |
| `trans` / `transFrom` / `plainTrans` | Translate a keyword (current locale, explicit locale, or bypassing the configured converter). |
| `transObject` | Build a typed Proxy that exposes translations as plain property reads. |
| `extend` | Register or merge keywords into a specific locale. |
| `groupedTranslations` | Register a keyword-first dictionary across many locales in one call. |
| `setCurrentLocaleCode` / `getCurrentLocaleCode` | Switch / read the active locale. |
| `setFallbackLocaleCode` / `getFallbackLocaleCode` | Switch / read the fallback locale. |
| `getTranslationLocaleCode` | Resolve the locale that translation should use (defers to current locale). |
| `setTranslationsList` / `getTranslationsList` / `getKeywordsListOf` | Bulk read/write of the underlying dictionary. |
| `setConverter` | Install a custom converter (e.g. `jsxConverter` for React). |
| `plainConverter` | The default `:placeholder` string converter. |
| `localizationEvents` | `onChange("localeCode" \| "fallback", cb)` — locale-switch notifications. |

## Translating

The whole API is two reads and a register call:

```ts
import { extend, trans, transFrom } from "@mongez/localization";

extend("en", { greet: "Hello :name", home: "Home" });
extend("ar", { home: "الرئيسية" });

trans("greet", { name: "Ada" });   // "Hello Ada"
transFrom("ar", "home");           // "الرئيسية"
```

If the keyword is missing in both the current and the fallback locale, the keyword string is returned as-is so missing keys are visible during development:

```ts
trans("never-defined");            // "never-defined"
```

## Placeholders

Default pattern is colon-prefixed (`:name`). Switch to `{{name}}` or any RegExp via `placeholderPattern`:

```ts
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  placeholderPattern: "doubleCurly",     // "colon" | "doubleCurly" | RegExp
});

extend("en", { hello: "Hi {{name}}" });
trans("hello", { name: "Ada" });   // "Hi Ada"
```

A placeholder that has no matching value in the passed object is left intact, so you can compose strings incrementally and still see the un-filled slots in the UI.

## Locale switching with events

```ts
import { localizationEvents, setCurrentLocaleCode } from "@mongez/localization";

const sub = localizationEvents.onChange("localeCode", (next, prev) => {
  console.log(`Locale changed: ${prev} → ${next}`);
});

setCurrentLocaleCode("ar");  // logs "Locale changed: en → ar"

sub.unsubscribe();           // stop listening
```

The same channel exists for the fallback locale:

```ts
localizationEvents.onChange("fallback", (next, prev) => {
  // …
});
```

Events fire on **every** `setCurrentLocaleCode` / `setFallbackLocaleCode` call, including when the new value equals the old one — the package doesn't dedupe.

## Grouped translations

Instead of one `extend` call per locale, declare a keyword-first object:

```ts
import { groupedTranslations, trans } from "@mongez/localization";

groupedTranslations({
  home:    { en: "Home",       ar: "الرئيسية" },
  contact: { en: "Contact Us", ar: "اتصل بنا" },
});

trans("home");                        // "Home"
```

Nesting works too — dot-notation reads back out the structure:

```ts
groupedTranslations({
  general: {
    home: { en: "Home", ar: "الرئيسية" },
  },
});

trans("general.home");                // "Home"
```

For namespacing a flat dictionary under a prefix, pass a group key as the first argument:

```ts
groupedTranslations("store", {
  orders:   { en: "Orders",   ar: "الطلبات" },
  products: { en: "Products", ar: "المنتجات" },
});

trans("store.orders");                // "Orders"
```

## Inline translation objects

`trans` and `transFrom` also accept the translation object itself as the keyword, so you can declare per-feature translations alongside the components that use them:

```ts
const t = {
  welcome: { en: "Welcome", ar: "مرحبا" },
};

trans(t.welcome);                     // current-locale value
transFrom("ar", t.welcome);           // "مرحبا"
```

When the requested locale is missing from the object, the package falls back to the configured fallback locale.

## transObject — typed property reads

`transObject(dict)` returns a `Proxy` over your dictionary. Direct property reads return the current-locale translation; `.p(key, placeholders)` interpolates; `.plain(key, placeholders)` uses the plain converter regardless of the global setting.

```ts
import { transObject } from "@mongez/localization";

const t = transObject({
  name:    { en: "name",    ar: "الاسم" },
  welcome: { en: "Hi :who", ar: "مرحبا :who" },
});

t.name;                               // current-locale value
t.p("welcome", { who: "Ada" });       // "Hi Ada"  (uses configured converter)
t.plain("welcome", { who: "Ada" });   // "Hi Ada"  (always plain converter)
```

The keys `p` and `plain` are reserved — declaring them in `dict` will be shadowed by the proxy methods.

## Count-based translations

Append a count-rule suffix to a keyword (`_zero`, `_one`, `_two`, `_three`, `_many`, `_negative`, `_other`) and pass `{ count: n }` to `trans` / `plainTrans`:

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

The selector goes through current-locale rules first, then fallback-locale rules, then `_other`, then the bare keyword — so partial translations degrade gracefully. Negative counts route to `_negative` and `:count` is interpolated as the absolute value.

Built-in rule packs exist for `en` and `ar`. Override per-locale via `countRules`:

```ts
setLocalizationConfigurations({
  countRules: {
    ar: {
      zero:  n => n === 0,
      one:   n => n === 1,
      two:   n => n === 2,
      few:   n => n % 100 >= 3 && n % 100 <= 10,
      many:  n => n % 100 >= 11,
      other: () => true,
    },
  },
});
```

## React

For JSX-aware placeholders (passing `<strong>…</strong>` as a placeholder value), install the React adapter and either:

1. Configure `jsxConverter` as the default converter, then keep using `trans` everywhere.
2. Or import `transX` from `@mongez/react-localization` directly — it always uses `jsxConverter` regardless of the global converter setting.

```tsx
import { setLocalizationConfigurations } from "@mongez/localization";
import { jsxConverter, transX } from "@mongez/react-localization";

setLocalizationConfigurations({ converter: jsxConverter });
// or
transX("welcome", { name: <strong>Ada</strong> });
```

See [`@mongez/react-localization`](https://github.com/hassanzohdy/mongez-react-localization) for the full React story.

## TypeScript

Everything is typed. The public surface lives in `src/types.ts`:

```ts
type TranslationsList = { [localeCode: string]: Keywords };
type Keywords = { [key: string]: string | Keywords };
type Converter = (
  keyword: string,
  placeholders: any,
  placeholderPattern: RegExp,
) => any;
type LocalizationConfigurations = {
  defaultLocaleCode?: string;
  fallback?: string;
  translations?: TranslationsList;
  converter?: Converter;
  placeholderPattern?: "colon" | "doubleCurly" | RegExp;
  countRules?: { [localeCode: string]: LanguageCountRules };
  // …
};
```

The `transObject<T>(dict)` proxy preserves the keys of `T` as a string-typed surface plus `p` and `plain` methods.

## Lifecycle events

Both locale events ride on the `@mongez/events` bus under the namespace `localization.change`:

- `localization.change.localeCode` — fired by `setCurrentLocaleCode`
- `localization.change.fallback` — fired by `setFallbackLocaleCode`

`localizationEvents.onChange(...)` is the typed wrapper; raw `events.subscribe("localization.change.localeCode", cb)` works too.

## Related packages

| Package | Purpose |
|---|---|
| [`@mongez/react-localization`](https://github.com/hassanzohdy/mongez-react-localization) | `jsxConverter`, `transX` — React/JSX placeholders. |
| [`@mongez/events`](https://github.com/hassanzohdy/events) | The tiny event bus. Used internally. |
| [`@mongez/reinforcements`](https://github.com/hassanzohdy/reinforcements) | TypeScript utility belt (`get`, `set`, `flatten`, `merge`). Used internally. |

## License

MIT
