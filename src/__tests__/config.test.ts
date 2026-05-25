import { beforeEach, describe, expect, it } from "vitest";
import {
  extend,
  getCurrentLocaleCode,
  getFallbackLocaleCode,
  getLocaleConfig,
  getLocalizationConfigurations,
  plainTrans,
  setLocalizationConfigurations,
  trans,
} from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("setLocalizationConfigurations", () => {
  it("stores the merged configuration", () => {
    setLocalizationConfigurations({
      defaultLocaleCode: "ar",
      fallback: "fr",
    });
    expect(getLocalizationConfigurations().defaultLocaleCode).toBe("ar");
    expect(getLocalizationConfigurations().fallback).toBe("fr");
  });

  it("applies defaultLocaleCode to the live current-locale state", () => {
    setLocalizationConfigurations({ defaultLocaleCode: "ar" });
    expect(getCurrentLocaleCode()).toBe("ar");
  });

  it("applies fallback to the live fallback-locale state", () => {
    setLocalizationConfigurations({ fallback: "fr" });
    expect(getFallbackLocaleCode()).toBe("fr");
  });

  it("seeds translations through the translations option", () => {
    setLocalizationConfigurations({
      translations: {
        en: { hello: "Hello" },
        ar: { hello: "أهلا" },
      },
    });
    expect(trans("hello")).toBe("Hello");
  });

  it("swaps the converter so subsequent trans() calls use it", () => {
    setLocalizationConfigurations({
      converter: (text, placeholders: any) =>
        text.replace(":item", `__${placeholders.item}__`),
    });
    extend("en", { create: "Create New :item" });
    expect(trans("create", { item: "Category" })).toBe(
      "Create New __Category__",
    );
  });

  it("retains unrelated config keys across successive calls (merge semantics)", () => {
    setLocalizationConfigurations({ defaultLocaleCode: "ar" });
    setLocalizationConfigurations({ fallback: "fr" });
    const cfg = getLocalizationConfigurations();
    expect(cfg.defaultLocaleCode).toBe("ar");
    expect(cfg.fallback).toBe("fr");
  });
});

describe("placeholderPattern config", () => {
  it("accepts the named 'colon' pattern", () => {
    setLocalizationConfigurations({ placeholderPattern: "colon" });
    extend("en", { create: "Create :item" });
    expect(plainTrans("create", { item: "X" })).toBe("Create X");
  });

  it("accepts the named 'doubleCurly' pattern", () => {
    setLocalizationConfigurations({ placeholderPattern: "doubleCurly" });
    extend("en", { create: "Create {{item}}" });
    expect(plainTrans("create", { item: "X" })).toBe("Create X");
  });

  it("accepts a custom RegExp", () => {
    setLocalizationConfigurations({ placeholderPattern: /\/([^/]+)\//g });
    extend("en", { create: "Create /item/" });
    expect(plainTrans("create", { item: "X" })).toBe("Create X");
  });

  it("leaves placeholders alone when the pattern doesn't match", () => {
    // colon-pattern interpolation should be invisible to a regex that only
    // matches `/something/`
    setLocalizationConfigurations({ placeholderPattern: /\/([^/]+)\//g });
    extend("en", { create: "Create :item" });
    expect(plainTrans("create", { item: "X" })).toBe("Create :item");
  });
});

describe("getLocaleConfig", () => {
  it("reads a single key from the merged config", () => {
    setLocalizationConfigurations({ defaultLocaleCode: "ar", fallback: "en" });
    expect(getLocaleConfig("defaultLocaleCode")).toBe("ar");
    expect(getLocaleConfig("fallback")).toBe("en");
  });

  it("returns the supplied default when the key is missing", () => {
    // `countRules` is never set in this file, and `getLocaleConfig` falls
    // back to the supplied default for missing keys.
    expect(getLocaleConfig("countRules", "fallback-default")).toBe(
      "fallback-default",
    );
  });
});
