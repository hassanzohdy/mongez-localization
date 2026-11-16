import { beforeEach, describe, expect, it } from "vitest";
import {
  extend,
  setFallbackLocaleCode,
  setLocalizationConfigurations,
  transFrom,
  transFromKeywords,
} from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
  // `setLocalizationConfigurations` merges its module-level config. Reset the
  // count settings this file depends on so a preceding range/count-rule spec
  // cannot change the meaning of the assertions below.
  setLocalizationConfigurations({
    countRanges: {
      enabled: false,
      separator: "_",
      ranges: [
        [0, 5],
        [6, 20],
        [21, Infinity],
      ],
    },
    countRules: {
      en: {
        negative: n => n < 0,
        zero: n => n === 0,
        one: n => n === 1,
        two: n => n === 2,
        three: n => n === 3,
        many: n => n > 3,
        other: () => true,
      },
    },
  });
});

describe("transFromKeywords", () => {
  it("reads only the supplied locale keywords and returns a missing key", () => {
    extend("en", { shared: "global value" });
    extend("ar", { shared: "global Arabic value" });
    setFallbackLocaleCode("en");

    expect(transFromKeywords("ar", { title: "Route title" }, "title")).toBe(
      "Route title",
    );
    expect(transFromKeywords("ar", { title: "Route title" }, "shared")).toBe(
      "shared",
    );
    expect(transFrom("ar", "shared")).toBe("global Arabic value");
  });

  it("uses scoped plural, range, formatting, and custom converter settings", () => {
    setLocalizationConfigurations({
      countRanges: { enabled: true },
      placeholderPattern: "doubleCurly",
      converter: (text, placeholders, pattern) =>
        `[${text.replace(pattern, (_, key) => String(placeholders[key]))}]`,
    });

    expect(
      transFromKeywords(
        "en",
        { orders_range_6_20: "{{count}} orders for {{name}}" },
        "orders",
        { count: 7, name: "Ada" },
      ),
    ).toBe("[7 orders for Ada]");
  });

  it("uses scoped _other and base variants without global fallback", () => {
    extend("en", { items_one: "global one" });
    setFallbackLocaleCode("en");

    expect(
      transFromKeywords(
        "ar",
        { items_other: ":count scoped items" },
        "items",
        { count: 1 },
      ),
    ).toBe("1 scoped items");
  });

  it("keeps present empty scoped translations distinct from missing keys", () => {
    expect(transFromKeywords("en", { empty: "" }, "empty")).toBe("");
    expect(
      transFromKeywords("en", { items_other: "" }, "items", { count: 0 }),
    ).toBe("");
    expect(
      transFromKeywords("en", { orders_zero: "" }, "orders", { count: 0 }),
    ).toBe("");
  });

  it("keeps inline translation object fallback behavior", () => {
    setFallbackLocaleCode("en");

    expect(
      transFromKeywords("ar", {}, { en: "Inline fallback" }),
    ).toBe("Inline fallback");
  });
});

describe("transFrom count fallback order (3.6.0)", () => {
  it("uses the current locale's _other before the fallback locale's count variant", () => {
    // Until 3.5.1 the fallback's `_one` won here, so an Arabic pack that defines
    // only `_other` showed English for a count of 1.
    extend("ar", { items_other: "Arabic other" });
    extend("en", { items_one: "English one" });
    setFallbackLocaleCode("en");

    expect(transFrom("ar", "items", { count: 1 })).toBe("Arabic other");
  });

  it("still uses the fallback's count variant when the current locale has neither", () => {
    extend("en", { things_one: "English one" });
    setFallbackLocaleCode("en");

    expect(transFrom("ar", "things", { count: 1 })).toBe("English one");
  });
});
