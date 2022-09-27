import {
  extend,
  getLocalizationConfigurations,
  setLocalizationConfigurations,
  trans,
} from "../src";

describe("localization/config", () => {
  beforeEach(() => {
    setLocalizationConfigurations({
      defaultLocaleCode: "en",
    });
  });
  it("should update default locale code", () => {
    setLocalizationConfigurations({
      defaultLocaleCode: "ar",
    });

    expect(getLocalizationConfigurations().defaultLocaleCode).toBe("ar");
  });

  it("should update default fallback locale code", () => {
    setLocalizationConfigurations({
      fallback: "fr",
    });

    expect(getLocalizationConfigurations().fallback).toBe("fr");
  });

  it("should use custom converter", () => {
    setLocalizationConfigurations({
      converter: (translatedText: string, placeholders?: any) => {
        return translatedText.replace(":item", "__" + placeholders.item + "__");
      },
    });

    extend("en", {
      createItem: "Create New :item",
    });

    expect(trans("createItem", { item: "Category" })).toBe(
      "Create New __Category__",
    );
  });
});
