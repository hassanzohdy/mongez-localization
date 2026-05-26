---
name: mongez-localization-events
description: |
  The `localizationEvents` bus — subscribing to locale and fallback changes via `onChange`, unsubscribing, and driving React re-renders or cookie/URL persistence without the React adapter.
  TRIGGER when: code imports `localizationEvents`, `LocaleCodeChangeCallback`, or `LocalizationEventName` from `@mongez/localization`; code calls `localizationEvents.onChange("localeCode", ...)` or `localizationEvents.onChange("fallback", ...)`; code subscribes to `localization.change.localeCode`/`localization.change.fallback` on `@mongez/events`; user asks "how do I react to a locale switch", "how do I persist the locale to a cookie/localStorage", "how do I sync the URL `?lang=` with the current locale", or "how do I trigger a React re-render on locale change without @mongez/react-localization".
  SKIP: `mongez-localization-translating` (just reading translations), `mongez-localization-recipes` (full end-to-end setups including events); `@mongez/react-localization` is the React-specific layer on top of this core — if it's already installed, prefer its `useCurrentLocale`/provider hooks over a hand-rolled subscriber.
---

# Events

`localizationEvents` is a thin wrapper over `@mongez/events` that publishes locale-switch notifications.

## Two channels

```ts
import { localizationEvents } from "@mongez/localization";

localizationEvents.onChange("localeCode", (next, prev) => {
  // Fired by setCurrentLocaleCode(...) or by
  // setLocalizationConfigurations({ defaultLocaleCode })
});

localizationEvents.onChange("fallback", (next, prev) => {
  // Fired by setFallbackLocaleCode(...) or by
  // setLocalizationConfigurations({ fallback })
});
```

```ts
type LocaleCodeChangeCallback = (newLocaleCode: string, oldLocaleCode: string) => void;
type LocalizationEventName = "localeCode" | "fallback";
```

## Subscription shape

`onChange` returns an `EventSubscription` (from `@mongez/events`) with an `unsubscribe()` method:

```ts
const sub = localizationEvents.onChange("localeCode", (next, prev) => {
  console.log(`${prev} → ${next}`);
});

// Later:
sub.unsubscribe();
```

## Underlying bus namespacing

Events fire on the `@mongez/events` bus under the namespace `localization.change`:

- `localization.change.localeCode` — current-locale changes
- `localization.change.fallback` — fallback-locale changes

So raw `events.subscribe("localization.change.localeCode", cb)` works too — `localizationEvents.onChange` is purely a typed convenience.

## Firing rules (gotcha)

Both setters fire their event on **every call**, including when the new value equals the old:

```ts
setCurrentLocaleCode("en");                // current is already "en"
// → localeCode event still fires, with (next: "en", prev: "en")
```

If you want change-only semantics (re-render on switch, not on idempotent set), dedupe in your subscriber:

```ts
localizationEvents.onChange("localeCode", (next, prev) => {
  if (next === prev) return;
  // …handle the actual switch
});
```

## Driving a re-render (React without the React adapter)

Hook into `localizationEvents` from a custom hook to re-render on locale changes:

```ts
import { useEffect, useState } from "react";
import {
  getCurrentLocaleCode,
  localizationEvents,
} from "@mongez/localization";

export function useCurrentLocale() {
  const [locale, setLocale] = useState(getCurrentLocaleCode);
  useEffect(() => {
    const sub = localizationEvents.onChange("localeCode", (next) => {
      setLocale(next);
    });
    return () => sub.unsubscribe();
  }, []);
  return locale;
}
```

Any component that calls `useCurrentLocale()` re-renders when the locale flips, and its `trans(...)` calls produce the new strings.

## Persisting the selected locale

Persistence is out of scope for the core package — wire it up in the subscriber:

```ts
localizationEvents.onChange("localeCode", (next) => {
  document.cookie = `locale=${next};path=/;max-age=31536000`;
});
```

For SSR you'd read the cookie on the server and call `setCurrentLocaleCode(cookieValue)` before rendering. Same pattern works for `localStorage`, IndexedDB, or a remote settings API.

## Driving translations from a query string

```ts
import { setCurrentLocaleCode } from "@mongez/localization";

const url = new URL(window.location.href);
const fromQuery = url.searchParams.get("lang");
if (fromQuery) setCurrentLocaleCode(fromQuery);
```

The `localeCode` event will fire and any subscribed components will rebuild.
