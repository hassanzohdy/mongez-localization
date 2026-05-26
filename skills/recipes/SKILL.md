---
name: mongez-localization-recipes
description: |
  Ready-to-copy patterns combining `extend`, `groupedTranslations`, `transObject`, `setLocalizationConfigurations`, `setCurrentLocaleCode`, `localizationEvents`, and `jsxConverter` — locale files, feature dictionaries, lazy-loading, URL/cookie sync, React re-renders, JSX placeholders, and pluralization.
  TRIGGER when: user asks "how do I set up @mongez/localization end-to-end", "give me a boilerplate for i18n", "how do I lazy-load locale files", "how do I sync the locale with a cookie or URL query string", "how do I pluralize a counter", or "how do I mix global keywords with feature-scoped translations"; code combines multiple `@mongez/localization` exports in a setup file.
  SKIP: the per-concern skills (`mongez-localization-translations`, `mongez-localization-translating`, `mongez-localization-interpolation`, `mongez-localization-count-translations`, `mongez-localization-events`) when only one concept is in scope — those go deeper on a single topic; `@mongez/react-localization` is the React-specific layer on top of this core — if it's installed, prefer its provider/hook recipes for JSX placeholders and re-render wiring.
---

# Recipes

Idiomatic compositions across `@mongez/localization` features.

## One file per locale (the simplest layout)

```ts
// src/locales/en.ts
import { extend } from "@mongez/localization";

extend("en", {
  home:    "Home",
  contact: "Contact Us",
  ui: {
    sidebar: "Sidebar",
    menu:    "Menu",
  },
});
```

```ts
// src/locales/ar.ts
import { extend } from "@mongez/localization";

extend("ar", {
  home:    "الرئيسية",
  contact: "اتصل بنا",
  ui: {
    sidebar: "الشريط الجانبي",
  },
});
```

```ts
// src/config/localization.ts
import "src/locales/en";
import "src/locales/ar";
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  defaultLocaleCode: "en",
  fallback: "en",
});
```

```ts
// src/index.ts
import "src/config/localization";
// rest of the app
```

## One file per feature (keyword-first)

```ts
// src/features/cart/locales.ts
import { groupedTranslations } from "@mongez/localization";

groupedTranslations("cart", {
  empty:    { en: "Your cart is empty",  ar: "سلتك فارغة" },
  checkout: { en: "Checkout",             ar: "الدفع" },
  total:    { en: "Total: :amount",       ar: "الإجمالي: :amount" },
});
```

Side-effect import to register them at boot:

```ts
// src/features/cart/index.ts
import "./locales";
export * from "./components";
```

## Typed feature dictionary with transObject

```ts
// src/features/auth/translations.ts
import { transObject } from "@mongez/localization";

export const t = transObject({
  signIn:        { en: "Sign In",         ar: "تسجيل الدخول" },
  signOut:       { en: "Sign Out",        ar: "تسجيل الخروج" },
  welcomeBack:   { en: "Welcome :name",   ar: "مرحبا :name" },
});
```

```tsx
// src/features/auth/UserMenu.tsx
import { t } from "./translations";

function UserMenu({ user }: { user: User }) {
  return (
    <>
      <h2>{t.p("welcomeBack", { name: user.name })}</h2>
      <button>{t.signOut}</button>
    </>
  );
}
```

`t.signOut` is typed as `string`. `t.p("welcomeBack", …)` typechecks against the keys you declared.

## Lazy-loading locales

```ts
import { extend, setCurrentLocaleCode } from "@mongez/localization";

const loaders: Record<string, () => Promise<Record<string, string>>> = {
  ar: () => import("./locales/ar.json").then(m => m.default),
  fr: () => import("./locales/fr.json").then(m => m.default),
};

export async function switchLocale(code: string) {
  if (loaders[code]) {
    const dict = await loaders[code]();
    extend(code, dict);
  }
  setCurrentLocaleCode(code);
}
```

Only the locales the user actually visits are downloaded. Subsequent switches to the same locale skip the import (the bundler caches the module).

## Sync the URL with the locale

```ts
import {
  getCurrentLocaleCode,
  localizationEvents,
  setCurrentLocaleCode,
} from "@mongez/localization";

// On boot: read from URL.
const url = new URL(window.location.href);
const fromQuery = url.searchParams.get("lang");
if (fromQuery) setCurrentLocaleCode(fromQuery);

// On switch: write back to URL.
localizationEvents.onChange("localeCode", (next) => {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", next);
  window.history.replaceState({}, "", url);
});
```

## Driving React re-renders without the React adapter

```ts
// src/hooks/useCurrentLocale.ts
import { useEffect, useState } from "react";
import { getCurrentLocaleCode, localizationEvents } from "@mongez/localization";

export function useCurrentLocale() {
  const [locale, setLocale] = useState(getCurrentLocaleCode);
  useEffect(() => {
    const sub = localizationEvents.onChange("localeCode", (next, prev) => {
      if (next !== prev) setLocale(next);
    });
    return () => sub.unsubscribe();
  }, []);
  return locale;
}
```

```tsx
function Header() {
  useCurrentLocale();                         // subscribe; ignore the return
  return <h1>{trans("home")}</h1>;
}
```

Any component that calls `useCurrentLocale()` will re-evaluate its `trans(...)` calls on locale switches.

## React with JSX placeholders

```tsx
import { setLocalizationConfigurations } from "@mongez/localization";
import { jsxConverter } from "@mongez/react-localization";

setLocalizationConfigurations({
  defaultLocaleCode: "en",
  fallback: "en",
  converter: jsxConverter,
});
```

```tsx
import { trans } from "@mongez/localization";

function PriceBanner() {
  return (
    <p>
      {trans("minimumOrder", {
        amount: <strong className="text-red-500">12 USD</strong>,
      })}
    </p>
  );
}
```

Or, without flipping the global converter, use `transX` from `@mongez/react-localization` for the one call.

## Persist the locale in a cookie

```ts
import { localizationEvents, setCurrentLocaleCode } from "@mongez/localization";

// On boot: read.
const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
if (match) setCurrentLocaleCode(decodeURIComponent(match[1]));

// On switch: write.
localizationEvents.onChange("localeCode", (next) => {
  document.cookie = `locale=${encodeURIComponent(next)};path=/;max-age=31536000`;
});
```

For SSR you'd parse the cookie from the request on the server, call `setCurrentLocaleCode(value)` before rendering, and rely on the same browser-side write on subsequent switches.

## Pluralize a counter

```ts
extend("en", {
  notification_zero:  "No new notifications",
  notification_one:   "1 new notification",
  notification_many:  ":count new notifications",
  notification_other: ":count new notifications",
});

function NotificationBadge({ count }: { count: number }) {
  return <span>{trans("notification", { count })}</span>;
}
```

Pass `count: 0`, `count: 1`, `count: 7` — each picks the right string.

## Mix global and feature translations

```ts
// Global keywords for the chrome/shell.
extend("en", { logout: "Sign Out", settings: "Settings" });

// Feature-local typed dictionary.
const t = transObject({
  signIn: { en: "Sign In", ar: "تسجيل الدخول" },
});

function UserMenu() {
  return (
    <>
      <button>{t.signIn}</button>
      <button>{trans("logout")}</button>
      <button>{trans("settings")}</button>
    </>
  );
}
```

Both flow through the same fallback chain and locale-switching events.
