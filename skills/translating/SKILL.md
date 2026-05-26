---
name: mongez-localization-translating
description: |
  The four translation lookup functions — `trans`, `transFrom`, `plainTrans`, and `transObject` — and how the fallback chain resolves a keyword.
  TRIGGER when: code imports `trans`, `transFrom`, `plainTrans`, `transObject`, `getTranslationLocaleCode`, `Translatable`, or `WithPlaceholder` from `@mongez/localization`; user asks "how do I translate a keyword", "how do I read a translation from a specific locale", "how do I get typed access to feature translations", or "why is my empty-string translation falling through to fallback"; `import { trans, transFrom, transObject } from "@mongez/localization"`.
  SKIP: `mongez-localization-translations` (registering dictionaries via `extend`/`groupedTranslations`), `mongez-localization-interpolation` (placeholder syntax and converters), `mongez-localization-count-translations` (count-based plural lookups); `@mongez/react-localization` is the React-specific layer on top of this core — use its `transX` and React hooks instead when working with JSX placeholders.
---

# Translating

Four functions read from the dictionary: `trans`, `transFrom`, `plainTrans`, `transObject`.

## trans(keyword, placeholders?, converter?)

The everyday call. Translates `keyword` against the current locale (or `getTranslationLocaleCode()` if a `translationLocalCode` override exists), falls back to the fallback locale, then returns the keyword itself.

```ts
import { trans, extend } from "@mongez/localization";

extend("en", { home: "Home" });
extend("ar", { home: "الرئيسية" });

trans("home");                          // "Home"
```

With placeholders:

```ts
extend("en", { create: "Create New :item" });
trans("create", { item: "Order" });     // "Create New Order"
```

`keyword` can also be an inline translation object:

```ts
const t = { welcome: { en: "Welcome", ar: "مرحبا" } };
trans(t.welcome);                       // "Welcome"  (current locale)
```

## transFrom(localeCode, keyword, placeholders?, converter?)

Translate from an **explicit** locale, ignoring the current one. The fallback chain still kicks in if the explicit locale doesn't have the keyword.

```ts
transFrom("ar", "home");                // "الرئيسية"
transFrom("klingon", "home");           // "Home"   (fallback to en)
transFrom("klingon", "missing");        // "missing" (nothing matched)
```

Useful for rendering a single string in a non-current locale (e.g. server-side rendering a notification email in the recipient's preferred language while the current locale is the sender's).

## plainTrans(keyword, placeholders?)

Same as `trans`, but always uses `plainConverter` — bypasses any configured converter. The escape hatch when you've installed `jsxConverter` globally for React but need a plain string in a specific spot (e.g. an `<input placeholder=…>` attribute that can't take JSX):

```ts
import { jsxConverter, transX } from "@mongez/react-localization";
import { setLocalizationConfigurations, plainTrans, trans } from "@mongez/localization";

setLocalizationConfigurations({ converter: jsxConverter });

trans("welcome", { name: <strong>Ada</strong> });        // returns JSX
plainTrans("welcome", { name: "Ada" });                  // returns "Hello Ada" string
```

## transObject(dict)

Builds a `Proxy` over a translation dictionary so that property reads do the lookup. Useful when you want **typed** access to a feature's translations and don't want to spell the keyword as a string at every call site.

```ts
import { transObject } from "@mongez/localization";

export const t = transObject({
  name:    { en: "name",     ar: "الاسم" },
  email:   { en: "email",    ar: "البريد" },
  welcome: { en: "Hi :who",  ar: "مرحبا :who" },
});

// Direct read — current-locale value.
t.name;                                  // "name"

// With placeholders — use .p(...) (uses configured converter).
t.p("welcome", { who: "Ada" });          // "Hi Ada"

// Force the plain converter for a single call.
t.plain("welcome", { who: "Ada" });      // "Hi Ada"  (plain string, even if jsxConverter is configured)
```

### Reserved keys

`p` and `plain` are reserved methods on the proxy. Declaring `p` or `plain` as keys in your dictionary will be shadowed by the methods.

### Fallback for unknown keys

If you read a key that isn't in the dictionary, the proxy falls through to a `transFrom(fallbackLocaleCode, key)` lookup against the global translations. This lets you mix per-feature `transObject` dictionaries with global keywords:

```ts
import { extend, transObject } from "@mongez/localization";

extend("en", { logout: "Sign Out" });

const t = transObject({
  login: { en: "Sign In", ar: "تسجيل الدخول" },
});

t.login;                                 // from the dictionary
(t as any).logout;                       // "Sign Out" — falls through to extend
```

(TypeScript will complain — the `as any` cast acknowledges you're stepping outside the typed surface.)

## getTranslationLocaleCode

```ts
getTranslationLocaleCode(): string
```

Returns `getLocalizationConfigurations().translationLocalCode || getCurrentLocaleCode()`. `trans` uses this internally to pick the locale. The override lets you decouple "the locale the user sees" from "the locale we look up translations in" — handy when locale codes follow country (`ar-eg`, `ar-sa`) but you want to choose at lookup time without redefining the current locale.

(Note: the config key is `translationLocalCode`, missing the `e`. This is a known typo — see CHANGELOG.)

## Fallback chain (plain lookup)

1. `translationsList[currentLocale][keyword]` (dot-notation reads through nested keyword objects).
2. `translationsList[fallbackLocale][keyword]`.
3. The keyword itself, unchanged.

For count-based translations the chain is more elaborate — see `count-translations.md`.

## Falsy-translation gotcha

`transFrom` uses `||` chains internally, so a translation that is the empty string `""` is treated as "missing" and falls through to the fallback. If you legitimately want an empty translation in one locale, you currently can't express it.
