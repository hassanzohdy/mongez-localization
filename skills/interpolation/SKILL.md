---
name: mongez-localization-interpolation
description: |
  How placeholder interpolation works — the default `:name` pattern, switching to `doubleCurly` or custom RegExp patterns, custom `Converter`s, and JSX placeholders via the React adapter.
  TRIGGER when: code imports `plainConverter`, `setConverter`, `Converter`, or sets `placeholderPattern`/`converter` on `setLocalizationConfigurations` from `@mongez/localization`; code passes a `placeholders` object to `trans`/`transFrom`; user asks "how do I change placeholder syntax to {{name}}", "how do I write a custom converter", "why is my placeholder left as `:name` in the output", or "how do I escape HTML in translations"; `import { plainConverter, setConverter } from "@mongez/localization"`.
  SKIP: `mongez-localization-count-translations` (count-based lookups — though `:count` is still interpolated via this layer), `mongez-localization-translating` (the lookup functions themselves); `@mongez/react-localization` is the React-specific layer on top of this core — use its `jsxConverter` and `transX` skills for JSX placeholder values like `<strong>`/`<Link>`.
---

# Interpolation

Placeholders are values you splice into a translation string at runtime.

## Default pattern: `:name`

```ts
extend("en", {
  greet: "Hello :name",
  create: "Create New :item",
});

trans("greet", { name: "Ada" });           // "Hello Ada"
trans("create", { item: "Category" });     // "Create New Category"
```

A placeholder name must match `[a-zA-Z0-9_-]+` and is prefixed by `:`. If a placeholder name has no matching key in the passed object, it's **left in the output as-is**:

```ts
trans("greet", {});                        // "Hello :name"
trans("greet", { name: "Ada", extra: 1 }); // "Hello Ada"  (extras ignored)
```

Numbers are stringified via `.toString()`.

## Switching the pattern

```ts
setLocalizationConfigurations({
  placeholderPattern: "doubleCurly",       // "colon" | "doubleCurly" | RegExp
});

extend("en", { greet: "Hi {{name}}" });
trans("greet", { name: "Ada" });            // "Hi Ada"
```

For something custom, pass a RegExp with one capture group (the placeholder name):

```ts
setLocalizationConfigurations({
  placeholderPattern: /\$\{([a-zA-Z]+)\}/g,
});

extend("en", { greet: "Hi ${name}" });
trans("greet", { name: "Ada" });            // "Hi Ada"
```

The pattern is global module state. Once changed, every subsequent translation uses it. There's no per-call override for the pattern.

## The default converter

```ts
function plainConverter(
  translation: string,
  placeholders: { [key: string]: string | number | undefined } = {},
  placeholderPattern: RegExp = /:([a-zA-Z0-9_-]+)/g,
): string;
```

`plainConverter` is `String.prototype.replace` over the placeholder pattern. Imported directly for testing or manual conversion:

```ts
import { plainConverter } from "@mongez/localization";

plainConverter("Hello :name", { name: "Ada" });  // "Hello Ada"
```

## Custom converters

A converter is `(translation, placeholders, placeholderPattern) => any`. The return type is not constrained — `jsxConverter` returns an array of React fragments rather than a string.

```ts
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  converter: (text, placeholders, pattern) => {
    return text.replace(pattern, (_, key) => `[${placeholders[key]}]`);
  },
});

trans("greet", { name: "Ada" });            // "Hello [Ada]"
```

Or via `setConverter` directly:

```ts
import { setConverter, plainConverter } from "@mongez/localization";

setConverter(myConverter);
// ... later, restore the default:
setConverter(plainConverter);
```

## When the converter runs

A converter is **only invoked when `trans` / `transFrom` is called with a `placeholders` argument**. A bare `trans("home")` returns the raw translation string with no converter call. This matters when you switch to `jsxConverter` globally — keywords without placeholders still return plain strings, not JSX nodes.

```ts
import { jsxConverter } from "@mongez/react-localization";
setConverter(jsxConverter);

trans("home");                              // "Home"  (plain string — no placeholders)
trans("greet", { name: "Ada" });            // [<>Hello </>, <>Ada</>]
```

## React: JSX placeholders

The React adapter (`@mongez/react-localization`) ships `jsxConverter` and a convenience `transX`. `jsxConverter` splits the translation on the placeholder pattern and wraps each segment in a `React.Fragment` so JSX values (a `<strong>`, a `<Link>`, …) interleave correctly:

```tsx
import { setConverter } from "@mongez/localization";
import { jsxConverter } from "@mongez/react-localization";

setConverter(jsxConverter);

trans("welcome", {
  name: <strong>Ada</strong>,
});
// → [<>Hello </>, <strong>Ada</strong>, <></>]
```

For a single-shot JSX call without flipping the global converter, use `transX`:

```tsx
import { transX } from "@mongez/react-localization";

transX("welcome", { name: <strong>Ada</strong> });
```

## Escaping / XSS notes

`plainConverter` uses `String.prototype.replace` — there is **no HTML escaping**. If your placeholders carry user-controlled data and you render the result via `dangerouslySetInnerHTML` or a `v-html` equivalent, you're responsible for escaping. The safe path is `jsxConverter` (React text nodes auto-escape) or a custom converter that escapes before substituting.
