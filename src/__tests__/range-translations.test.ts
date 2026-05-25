import { beforeEach, describe, expect, it } from "vitest";
import { extend, plainTrans, setLocalizationConfigurations } from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("range-based count keys (countRanges.enabled)", () => {
  beforeEach(() => {
    // Re-assert the default separator on every case so a prior test that
    // overrode it (deep-merge means `separator: "-"` persists otherwise)
    // can't leak across describe boundaries.
    setLocalizationConfigurations({
      countRanges: { enabled: true, separator: "_" },
    });
  });

  it("0-5 maps to _range_0_5", () => {
    extend("en", {
      people_range_0_5: "Few (:count)",
      people_range_6_20: "Some (:count)",
      people_range_21_plus: "Many (:count)",
    });
    expect(plainTrans("people", { count: 3 })).toBe("Few (3)");
  });

  it("6-20 maps to _range_6_20", () => {
    extend("en", {
      people_range_0_5: "Few (:count)",
      people_range_6_20: "Some (:count)",
      people_range_21_plus: "Many (:count)",
    });
    expect(plainTrans("people", { count: 15 })).toBe("Some (15)");
  });

  it("21+ maps to _range_21_plus", () => {
    extend("en", {
      people_range_0_5: "Few (:count)",
      people_range_6_20: "Some (:count)",
      people_range_21_plus: "Many (:count)",
    });
    expect(plainTrans("people", { count: 50 })).toBe("Many (50)");
  });

  it("countRanges.separator changes the suffix delimiter", () => {
    setLocalizationConfigurations({
      countRanges: { enabled: true, separator: "-" },
    });
    extend("en", {
      "people_range-0-5": "Few (:count)",
    });
    expect(plainTrans("people", { count: 3 })).toBe("Few (3)");
  });

  it("countRanges.ranges configures custom thresholds", () => {
    setLocalizationConfigurations({
      countRanges: {
        enabled: true,
        separator: "_",
        ranges: [
          [0, 99],
          [100, 200],
          [201, Infinity],
        ],
      },
    });
    extend("en", {
      people_range_100_200: "A crowd (:count)",
    });
    expect(plainTrans("people", { count: 150 })).toBe("A crowd (150)");
  });
});

describe("configuration key `translationLocaleCode`", () => {
  it("the documented name routes translations through the chosen locale", () => {
    setLocalizationConfigurations({
      translationLocaleCode: "ar",
    });
    extend("en", { hello: "Hi" });
    extend("ar", { hello: "أهلا" });
    // `translationLocaleCode` overrides the current locale at lookup time,
    // even though `setCurrentLocaleCode` was never called.
    expect(plainTrans("hello")).toBe("أهلا");
  });

  it("the legacy misspelled `translationLocalCode` still works (backward compat)", () => {
    setLocalizationConfigurations({
      translationLocalCode: "ar",
    });
    extend("en", { hello: "Hi" });
    extend("ar", { hello: "أهلا" });
    expect(plainTrans("hello")).toBe("أهلا");
  });

  it("the documented name wins when both spellings are set", () => {
    setLocalizationConfigurations({
      translationLocaleCode: "ar",
      translationLocalCode: "fr",
    });
    extend("en", { hello: "Hi" });
    extend("ar", { hello: "أهلا" });
    extend("fr", { hello: "Salut" });
    expect(plainTrans("hello")).toBe("أهلا");
  });
});
