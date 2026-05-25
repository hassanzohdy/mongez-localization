import { beforeEach, describe, expect, it } from "vitest";
import {
  extend,
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  transObject,
} from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("transObject — direct property reads", () => {
  it("returns the current-locale translation for each declared key", () => {
    const t = transObject({
      name: { en: "name", ar: "الاسم" },
      email: { en: "email", ar: "البريد" },
    });
    expect(t.name).toBe("name");
    expect(t.email).toBe("email");
  });

  it("follows setCurrentLocaleCode for direct reads", () => {
    const t = transObject({
      name: { en: "name", ar: "الاسم" },
    });
    setCurrentLocaleCode("ar");
    expect(t.name).toBe("الاسم");
  });

  it("returns a sibling keyword from the global translations on unknown keys", () => {
    // Unknown keys on the transObject Proxy fall through to the global
    // translations under the fallback locale, then to the raw key.
    extend("en", { sidebar: "Sidebar" });
    setFallbackLocaleCode("en");
    const t = transObject({
      name: { en: "name", ar: "الاسم" },
    });
    expect((t as any).sidebar).toBe("Sidebar");
    expect((t as any).nope).toBe("nope");
  });
});

describe("transObject.p — placeholders", () => {
  it("interpolates against the current-locale translation", () => {
    const t = transObject({
      welcome: { en: "Hello :name", ar: "مرحبا :name" },
    });
    expect(t.p("welcome", { name: "Ada" })).toBe("Hello Ada");
  });

  it("follows the current locale", () => {
    const t = transObject({
      welcome: { en: "Hello :name", ar: "مرحبا :name" },
    });
    setCurrentLocaleCode("ar");
    expect(t.p("welcome", { name: "Ada" })).toBe("مرحبا Ada");
  });
});

describe("transObject.plain — bypasses the configured converter", () => {
  it("uses the plain converter even if a different one is configured", () => {
    const t = transObject({
      welcome: { en: "Hello :name", ar: "مرحبا :name" },
    });
    expect(t.plain("welcome", { name: "Ada" })).toBe("Hello Ada");
  });
});
