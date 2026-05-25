---
name: mongez-localization-translations
description: How to register and manage translation dictionaries using extend(), groupedTranslations(), and setTranslationsList().
when_to_use: User calls extend() or groupedTranslations() to register translations, asks how to structure a TranslationsList, asks about one-file-per-locale vs one-file-per-feature patterns, asks how to load translations from JSON, or asks about the TranslationsList / Keywords types.
---

# Translations

The translation dictionary is a `TranslationsList = { [localeCode: string]: Keywords }`, where `Keywords` is a recursive map of strings or nested keyword groups.

## Shape

```ts
type TranslationsList = { [localeCode: string]: Keywords };
type Keywords = { [key: string]: string | Keywords };
```

```ts
const translations: TranslationsList = {
  en: {
    home: "Home",
    ui: {
      sidebar: "Sidebar",
      menu:    "Menu",
    },
  },
  ar: {
    home: "الرئيسية",
    ui: {
      sidebar: "الشريط الجانبي",
    },
  },
};
```

Reads use dot-notation: `trans("ui.sidebar")` reads `translations[currentLocale].ui.sidebar`.

## extend(localeCode, keywords)

The idiomatic registration call. Multiple calls for the same locale merge — keep one file per locale and re-`extend` per feature:

```ts
// src/locales/en.ts
import { extend } from "@mongez/localization";

extend("en", { home: "Home" });
extend("en", { contact: "Contact Us" });
extend("en", {
  ui: { sidebar: "Sidebar" },
});
```

The merge is recursive (provided by `@mongez/reinforcements`' `merge`), so nested groups accumulate too.

## groupedTranslations(groupKey?, dict)

Declares translations **keyword-first** (every keyword carries its locale map), the inverse of `extend`:

```ts
import { groupedTranslations } from "@mongez/localization";

groupedTranslations({
  home:    { en: "Home",       ar: "الرئيسية" },
  contact: { en: "Contact Us", ar: "اتصل بنا" },
});
```

Optionally namespace a flat dictionary under a prefix:

```ts
groupedTranslations("store", {
  orders:   { en: "Orders",   ar: "الطلبات" },
  products: { en: "Products", ar: "المنتجات" },
});
// Reads as: trans("store.orders"), trans("store.products")
```

Nested groups work too — the locale map is whichever leaf object has only string leaves:

```ts
groupedTranslations({
  general: {
    home: { en: "Home", ar: "الرئيسية" },
  },
});
// trans("general.home")
```

Internally, `groupedTranslations` flattens the input, splits each path on `.`, treats the last segment as the locale code, and writes the leaf into `translationsList[localeCode][keyword]`. So `groupedTranslations` and `extend` write into the same underlying map — you can mix them freely.

## setTranslationsList / getTranslationsList / getKeywordsListOf

```ts
setTranslationsList(list: TranslationsList): void  // full replace
getTranslationsList(): TranslationsList            // live reference
getKeywordsListOf(locale: string): Keywords | null
```

`setTranslationsList` replaces the entire map — useful when you load translations from a single JSON file at boot:

```ts
setTranslationsList(await fetch("/api/i18n").then(r => r.json()));
```

Alternatively, set translations via the configuration object:

```ts
setLocalizationConfigurations({
  translations: { en: { home: "Home" }, ar: { home: "الرئيسية" } },
});
```

`setLocalizationConfigurations({ translations })` calls `setTranslationsList` internally — same effect.

## Pattern: one file per locale

```ts
// src/locales/en.ts
import { extend } from "@mongez/localization";
extend("en", { home: "Home", contact: "Contact" });

// src/locales/ar.ts
import { extend } from "@mongez/localization";
extend("ar", { home: "الرئيسية", contact: "اتصل" });

// src/config/localization.ts
import "src/locales/en";
import "src/locales/ar";
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  defaultLocaleCode: "en",
  fallback: "en",
});
```

## Pattern: one file per feature (keyword-first)

```ts
// src/features/cart/locales.ts
import { groupedTranslations } from "@mongez/localization";

groupedTranslations("cart", {
  empty:    { en: "Your cart is empty",  ar: "سلتك فارغة" },
  checkout: { en: "Checkout",             ar: "الدفع" },
});
```

```ts
// somewhere in the cart feature
trans("cart.empty");
trans("cart.checkout");
```

The downside is that lookups via the dynamic string (`trans("cart.empty")`) don't get keyword-scope type checking. If you want that, see `translating.md` for `transObject`.
