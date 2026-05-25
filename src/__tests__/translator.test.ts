import { beforeEach, describe, expect, it } from "vitest";
import {
  extend,
  getCurrentLocaleCode,
  getFallbackLocaleCode,
  getKeywordsListOf,
  getTranslationsList,
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  trans,
  transFrom,
} from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("setCurrentLocaleCode / getCurrentLocaleCode", () => {
  it("defaults to en", () => {
    expect(getCurrentLocaleCode()).toBe("en");
  });

  it("reflects the most recent set call", () => {
    setCurrentLocaleCode("ar");
    expect(getCurrentLocaleCode()).toBe("ar");
    setCurrentLocaleCode("fr");
    expect(getCurrentLocaleCode()).toBe("fr");
  });
});

describe("setFallbackLocaleCode / getFallbackLocaleCode", () => {
  it("defaults to en", () => {
    expect(getFallbackLocaleCode()).toBe("en");
  });

  it("reflects the most recent set call", () => {
    setFallbackLocaleCode("ar");
    expect(getFallbackLocaleCode()).toBe("ar");
  });
});

describe("extend", () => {
  it("seeds a locale's keyword bag", () => {
    extend("en", { hello: "Hello" });
    expect(getKeywordsListOf("en")).toEqual({ hello: "Hello" });
  });

  it("merges with previously-extended keywords for the same locale", () => {
    extend("en", { hello: "Hello" });
    extend("en", { bye: "Bye" });
    expect(getKeywordsListOf("en")).toEqual({ hello: "Hello", bye: "Bye" });
  });

  it("supports nested keyword objects (dot-notation reads)", () => {
    extend("en", { ui: { home: "Home" } });
    expect(trans("ui.home")).toBe("Home");
  });

  it("returns null for an unknown locale", () => {
    expect(getKeywordsListOf("klingon")).toBeNull();
  });
});

describe("trans — plain lookup", () => {
  beforeEach(() => {
    extend("en", { hello: "Hello World", bye: "Goodbye" });
    extend("ar", { hello: "أهلا بكم" });
  });

  it("returns the translation for the current locale", () => {
    expect(trans("hello")).toBe("Hello World");
  });

  it("follows setCurrentLocaleCode without restating the keyword", () => {
    setCurrentLocaleCode("ar");
    expect(trans("hello")).toBe("أهلا بكم");
  });

  it("returns the keyword itself when nothing matches anywhere", () => {
    expect(trans("missingKeyword")).toBe("missingKeyword");
  });
});

describe("trans — fallback chain", () => {
  it("falls back to the fallback locale when the current locale lacks the key", () => {
    extend("en", { contact: "Contact Us" });
    setCurrentLocaleCode("ar");
    setFallbackLocaleCode("en");
    // ar has no "contact" key; fallback to en
    expect(trans("contact")).toBe("Contact Us");
  });

  it("returns the keyword when both current and fallback miss", () => {
    extend("en", { hello: "Hello" });
    setCurrentLocaleCode("ar");
    setFallbackLocaleCode("en");
    expect(trans("missing")).toBe("missing");
  });
});

describe("transFrom", () => {
  beforeEach(() => {
    extend("en", { hello: "Hello" });
    extend("ar", { hello: "أهلا" });
  });

  it("translates from an explicit locale, ignoring the current one", () => {
    setCurrentLocaleCode("en");
    expect(transFrom("ar", "hello")).toBe("أهلا");
  });

  it("falls back when the explicit locale doesn't have the keyword", () => {
    setFallbackLocaleCode("en");
    expect(transFrom("klingon", "hello")).toBe("Hello");
  });

  it("accepts a translation object as the keyword", () => {
    const t = { home: { en: "Home", ar: "الرئيسية" } };
    expect(transFrom("ar", t.home)).toBe("الرئيسية");
    expect(transFrom("en", t.home)).toBe("Home");
  });

  it("falls back to fallbackLocaleCode when the object lacks the requested locale", () => {
    const t = { home: { en: "Home" } };
    setFallbackLocaleCode("en");
    expect(transFrom("ar", t.home)).toBe("Home");
  });
});

describe("getTranslationsList", () => {
  it("returns the live translations map", () => {
    extend("en", { hello: "Hello" });
    extend("ar", { hello: "أهلا" });
    expect(getTranslationsList()).toEqual({
      en: { hello: "Hello" },
      ar: { hello: "أهلا" },
    });
  });
});
