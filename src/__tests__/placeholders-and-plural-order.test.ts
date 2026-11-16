import { beforeEach, describe, expect, it } from "vitest";
import {
  extend,
  plainConverter,
  plainTrans,
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  setLocalizationConfigurations,
  trans,
} from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("colon placeholders stop at a hyphen", () => {
  it("reads :minutes-min as the placeholder :minutes followed by literal -min", () => {
    extend("en", { wait: "Wait :minutes-min" });

    expect(plainTrans("wait", { minutes: 5 })).toBe("Wait 5-min");
  });

  it("uses the hyphenated key when the placeholders object has that exact key", () => {
    extend("en", { wait: "Wait :minutes-min" });

    expect(plainTrans("wait", { "minutes-min": 5 })).toBe("Wait 5");
  });

  it("prefers the exact hyphenated key over the plain name", () => {
    extend("en", { wait: "Wait :minutes-min" });

    expect(plainTrans("wait", { minutes: 3, "minutes-min": 7 })).toBe("Wait 7");
  });

  it("keeps the original placeholder when neither the name nor the hyphenated key exists", () => {
    extend("en", { wait: "Wait :minutes-min" });

    expect(plainTrans("wait", { other: 1 })).toBe("Wait :minutes-min");
  });

  it("still joins underscores and digits into the name", () => {
    extend("en", { id: "Item :item_2 and :a1" });

    expect(plainTrans("id", { item_2: "X", a1: "Y" })).toBe("Item X and Y");
  });

  it("resolves a longer hyphenated key that spans several segments", () => {
    expect(
      plainConverter(":a-b-c and :a-b", { "a-b-c": 1, "a-b": 2 }),
    ).toBe("1 and 2");
  });

  it("replaces the plain name and keeps the hyphen segments when no hyphenated key exists", () => {
    expect(plainConverter(":a-b-c", { a: 1 })).toBe("1-b-c");
  });

  it("uses the longest hyphenated key that exists", () => {
    expect(plainConverter(":a-b-c", { a: 1, "a-b": 2 })).toBe("2-c");
  });

  it("keeps working with a custom RegExp that captures hyphens", () => {
    expect(
      plainConverter("Wait :minutes-min", { "minutes-min": 5 }, /:([a-zA-Z0-9_-]+)/g),
    ).toBe("Wait 5");
  });

  it("replaces only the first occurrence with a non-global pattern", () => {
    expect(plainConverter(":a :a", { a: 1 }, /:([a-z]+)/)).toBe("1 :a");
  });

  it("does not join hyphen text after a closing delimiter into the key", () => {
    expect(
      plainConverter("{{a}}-b", { a: 1, "a-b": 2 }, /{{([a-zA-Z0-9_-]+)}}/g),
    ).toBe("1-b");
  });
});

describe("plural fallback order", () => {
  beforeEach(() => {
    setCurrentLocaleCode("ar");
    setFallbackLocaleCode("en");
  });

  it("uses the current locale's _other before the fallback's _one for count 1", () => {
    // Arabic-like locale: defines only `_other`
    extend("ar", { apples_other: "تفاحات :count" });
    extend("en", { apples_one: "One apple", apples_other: ":count apples" });

    expect(plainTrans("apples", { count: 1 })).toBe("تفاحات 1");
    expect(trans("apples", { count: 1 })).toBe("تفاحات 1");
  });

  it("uses the current locale's specific variant before its _other", () => {
    extend("ar", { apples_one: "تفاحة", apples_other: "تفاحات" });

    expect(plainTrans("apples", { count: 1 })).toBe("تفاحة");
  });

  it("uses the fallback's specific variant before the fallback's _other when the current locale has none", () => {
    extend("en", { apples_one: "One apple", apples_other: ":count apples" });

    expect(plainTrans("apples", { count: 1 })).toBe("One apple");
    expect(plainTrans("apples", { count: 5 })).toBe("5 apples");
  });

  it("uses the fallback's _other when the fallback has no specific variant for the count", () => {
    extend("en", { apples_other: ":count apples" });

    expect(plainTrans("apples", { count: 1 })).toBe("1 apples");
  });

  it("uses the current locale's bare keyword only after the fallback's count variants", () => {
    extend("ar", { apples: "تفاح" });
    extend("en", { apples_one: "One apple" });

    expect(plainTrans("apples", { count: 1 })).toBe("One apple");
  });

  it("uses the current locale's bare keyword when no count variant exists in either locale", () => {
    extend("ar", { apples: "تفاح" });

    expect(plainTrans("apples", { count: 1 })).toBe("تفاح");
  });

  it("falls back to the bare keyword of the fallback locale last", () => {
    extend("en", { apples: "Apples" });

    expect(plainTrans("apples", { count: 1 })).toBe("Apples");
  });

  it("applies the same order with a custom current locale that uses only _other", () => {
    setLocalizationConfigurations({
      countRules: {
        xx: { other: () => true },
      },
    });
    setCurrentLocaleCode("xx");
    extend("xx", { items_other: "xx :count" });
    extend("en", { items_one: "one item", items_other: ":count items" });

    expect(plainTrans("items", { count: 1 })).toBe("xx 1");
  });
});
