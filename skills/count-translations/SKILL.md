---
name: mongez-localization-count-translations
description: Plural/count-based translations — keyword suffixes (_zero, _one, _many, etc.), built-in English and Arabic rules, custom countRules, range-based suffixes, and the full selector chain.
when_to_use: User passes { count: n } to trans(), asks how to pluralize a keyword, asks about _zero/_one/_many/_other suffixes, asks about Arabic plural rules, asks how to define custom count rules via countRules, asks about countRanges, or asks about the full fallback chain for count-based lookups.
---

# Count-based translations

Suffix a keyword with a count-rule name and pass `{ count: n }` to `trans` / `plainTrans`. The translator picks the matching suffix automatically.

## Default suffixes (English)

| Suffix | Matches when |
|---|---|
| `_negative` | `n < 0` |
| `_zero` | `n === 0` |
| `_one` | `n === 1` |
| `_two` | `n === 2` |
| `_three` | `n === 3` |
| `_many` | `n > 3` |
| `_other` | fallback (matches anything not caught above) |

```ts
extend("en", {
  products_zero:  "No products",
  products_one:   "One product",
  products_two:   "A pair of products",
  products_three: "A trio of products",
  products_many:  "Many products (:count in stock)",
  products_other: ":count products",
});

trans("products", { count: 0 });            // "No products"
trans("products", { count: 1 });            // "One product"
trans("products", { count: 4 });            // "Many products (4 in stock)"
trans("products", { count: 100 });          // "Many products (100 in stock)"
```

`:count` is interpolated as the **absolute value** of the input — `count: -5` interpolates as `5` and routes to `_negative`:

```ts
extend("en", {
  balance_negative: "Overdrawn by :count",
  balance_other:    ":count remaining",
});

trans("balance", { count: -7 });            // "Overdrawn by 7"
trans("balance", { count: 7 });             // "7 remaining"
```

## Arabic (built-in)

| Suffix | Matches when |
|---|---|
| `_negative` | `n < 0` |
| `_zero` | `n === 0` |
| `_one` | `n === 1` |
| `_two` | `n === 2` |
| `_few` | `Math.abs(n) % 100` in `[3, 10]` |
| `_many` | `Math.abs(n) % 100` in `[11, 99]` |
| `_other` | fallback |

Note: `_many` cuts off at `% 100 === 99`. Counts of 100, 200, 1000 land on `_other`, not `_many`. (The README states "count > 10" without that upper bound — known gap.)

```ts
extend("ar", {
  fruits_zero:  "لا فواكه",
  fruits_one:   "فاكهة",
  fruits_two:   "فاكهتان",
  fruits_few:   ":count فواكه",
  fruits_many:  ":count فاكهة",
  fruits_other: ":count فاكهة",
});

setCurrentLocaleCode("ar");
trans("fruits", { count: 3 });              // "3 فواكه"   (few)
trans("fruits", { count: 11 });             // "11 فاكهة"  (many)
```

## Custom count rules

Override per-locale via `countRules`:

```ts
setLocalizationConfigurations({
  countRules: {
    fr: {
      one:   n => n === 0 || n === 1,       // French treats 0 and 1 as one
      other: () => true,
    },
    pl: {
      one: n => n === 1,
      few: n => {
        const mod10 = n % 10, mod100 = n % 100;
        return mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14);
      },
      many: n => {
        const mod10 = n % 10, mod100 = n % 100;
        return mod10 === 0
          || (mod10 >= 5 && mod10 <= 9)
          || (mod100 >= 12 && mod100 <= 14);
      },
      other: () => true,
    },
  },
});
```

Custom rule packs **replace** the built-in pack for that locale; they don't merge. If you want a tweaked English rule set, copy the defaults and add your overrides.

The match order is the iteration order of `Object.entries(rules)`, with `negative` checked first regardless of position. The first rule that returns `true` wins. Always provide an `other` (matching `true`) at the end as a safety net.

## Selector chain (full)

When `trans(keyword, { count })` runs, the lookup tries:

1. `translationsList[currentLocale][keyword + <currentLocaleCountKey>]`
2. `translationsList[fallbackLocale][keyword + <fallbackLocaleCountKey>]`
3. `translationsList[currentLocale][keyword + "_other"]`
4. `translationsList[fallbackLocale][keyword + "_other"]`
5. `translationsList[currentLocale][keyword]`
6. `translationsList[fallbackLocale][keyword]`
7. The keyword itself, returned unchanged.

This means partial translations degrade gracefully — if you have `_one` and `_other` in English but only a bare `apples` in Arabic, an Arabic user gets the English `apples_other` rather than nothing.

## Coercion

`count` accepts `number` or numeric string. The translator calls `Number(count)` before evaluating rules:

```ts
trans("views", { count: "5" });             // works
trans("views", { count: 5 });               // also works
```

`NaN`, `Infinity`, and non-numeric strings will pass through `Number()` but the resulting rule match is unspecified — pass real numbers.

## Range-based counts

`countRanges.enabled: true` activates a parallel suffix scheme:

```ts
setLocalizationConfigurations({ countRanges: { enabled: true } });

extend("en", {
  people_range_0_5:    "Few (:count)",
  people_range_6_20:   "Some (:count)",
  people_range_21_plus: "Many (:count)",
});

trans("people", { count: 3 });              // "Few (3)"
trans("people", { count: 15 });             // "Some (15)"
trans("people", { count: 50 });             // "Many (50)"
```

Default thresholds are `[[0, 5], [6, 20], [21, Infinity]]`. The open-ended bucket renders `Infinity` as `plus` in the key (so `_range_21_plus`).

### Custom thresholds

Pass `ranges` as an array of `[min, max]` tuples:

```ts
setLocalizationConfigurations({
  countRanges: {
    enabled: true,
    ranges: [
      [0, 99],
      [100, 999],
      [1000, Infinity],
    ],
  },
});

extend("en", {
  visits_range_0_99:       "Just a few (:count)",
  visits_range_100_999:    "A nice batch (:count)",
  visits_range_1000_plus:  "Going viral (:count)",
});

trans("visits", { count: 42 });             // "Just a few (42)"
trans("visits", { count: 5000 });           // "Going viral (5000)"
```

### Custom separator

`countRanges.separator` (default `_`) controls the delimiter inside the suffix:

```ts
setLocalizationConfigurations({
  countRanges: { enabled: true, separator: "-" },
});

extend("en", {
  "people_range-0-5":    "Few (:count)",
  "people_range-6-20":   "Some (:count)",
  "people_range-21-plus": "Many (:count)",
});

trans("people", { count: 3 });              // "Few (3)"
```

The leading `_range` prefix is fixed; only the delimiter between `range`, `min`, and `max` follows `separator`.

## Anti-pattern: regular placeholders that look like counts

Don't name a regular placeholder `count` unless you actually want the count machinery to run:

```ts
extend("en", { greet: "Hi :count people" });
trans("greet", { count: 5 });
// → resolves the count rule, looks for "greet_many", doesn't find it,
//   falls through to "greet" → "Hi 5 people"
```

It works by luck here. But if you also have a `greet_one`, that translation will be selected when `count: 1` is passed, even if you didn't intend pluralization. Pick a different placeholder name (`:n`, `:total`, `:amount`) when you don't want the rule machinery.
