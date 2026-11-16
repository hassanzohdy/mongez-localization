import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  extend,
  getTranslationsRevision,
  groupedTranslations,
  localizationEvents,
  setTranslationsList,
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  setLocalizationConfigurations,
} from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("localizationEvents.onChange('localeCode')", () => {
  it("fires on every setCurrentLocaleCode call", () => {
    const spy = vi.fn();
    localizationEvents.onChange("localeCode", spy);

    setCurrentLocaleCode("ar");
    setCurrentLocaleCode("fr");

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(1, "ar", "en");
    expect(spy).toHaveBeenNthCalledWith(2, "fr", "ar");
  });

  it("passes the new code as the first arg and the old code as the second", () => {
    let captured: [string, string] | null = null;
    localizationEvents.onChange("localeCode", (newCode, oldCode) => {
      captured = [newCode, oldCode];
    });
    setCurrentLocaleCode("ja");
    expect(captured).toEqual(["ja", "en"]);
  });

  it("fires when defaultLocaleCode flows through setLocalizationConfigurations", () => {
    const spy = vi.fn();
    localizationEvents.onChange("localeCode", spy);
    setLocalizationConfigurations({ defaultLocaleCode: "ar" });
    expect(spy).toHaveBeenCalledWith("ar", "en");
  });

  it("returns a subscription whose unsubscribe stops further callbacks", () => {
    const spy = vi.fn();
    const sub = localizationEvents.onChange("localeCode", spy);
    setCurrentLocaleCode("ar");
    sub.unsubscribe();
    setCurrentLocaleCode("fr");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("localizationEvents.onChange('fallback')", () => {
  it("fires on every setFallbackLocaleCode call", () => {
    const spy = vi.fn();
    localizationEvents.onChange("fallback", spy);
    setFallbackLocaleCode("ar");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("ar", "en");
  });

  it("is a separate channel from localeCode (cross-listening does not fire)", () => {
    const localeSpy = vi.fn();
    const fallbackSpy = vi.fn();
    localizationEvents.onChange("localeCode", localeSpy);
    localizationEvents.onChange("fallback", fallbackSpy);

    setFallbackLocaleCode("ar");
    expect(fallbackSpy).toHaveBeenCalledTimes(1);
    expect(localeSpy).not.toHaveBeenCalled();

    setCurrentLocaleCode("fr");
    expect(localeSpy).toHaveBeenCalledTimes(1);
    expect(fallbackSpy).toHaveBeenCalledTimes(1); // unchanged
  });
});

describe("localizationEvents.onChange('translations') and getTranslationsRevision", () => {
  it("fires after extend with the locale code and bumps the revision", () => {
    const spy = vi.fn();
    localizationEvents.onChange("translations", spy);
    const before = getTranslationsRevision();

    extend("en", { hello: "Hello" });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(["en"]);
    expect(getTranslationsRevision()).toBe(before + 1);
  });

  it("fires after groupedTranslations with every affected locale code", () => {
    const spy = vi.fn();
    localizationEvents.onChange("translations", spy);
    const before = getTranslationsRevision();

    groupedTranslations({ home: { en: "Home", ar: "الرئيسية" } });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].sort()).toEqual(["ar", "en"]);
    expect(getTranslationsRevision()).toBe(before + 1);
  });

  it("fires after setTranslationsList with old and new locale codes", () => {
    extend("en", { a: "A" });
    const spy = vi.fn();
    localizationEvents.onChange("translations", spy);
    const before = getTranslationsRevision();

    setTranslationsList({ fr: { a: "A" } });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].sort()).toEqual(["en", "fr"]);
    expect(getTranslationsRevision()).toBe(before + 1);
  });

  it("does not fire for locale or fallback changes", () => {
    const spy = vi.fn();
    localizationEvents.onChange("translations", spy);
    setCurrentLocaleCode("ar");
    setFallbackLocaleCode("ar");
    expect(spy).not.toHaveBeenCalled();
  });
});
