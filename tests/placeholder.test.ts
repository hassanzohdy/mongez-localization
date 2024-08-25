import { extend, plainTrans, setLocalizationConfigurations } from "../src";

describe("localization/plainTrans", () => {
  beforeEach(() => {
    setLocalizationConfigurations({
      defaultLocaleCode: "en",
    });
  });

  it("should translate the keyword using placeholder", () => {
    extend("en", {
      createItem: "Create New :item",
    });
    expect(plainTrans("createItem", { item: "Category" })).toBe(
      "Create New Category",
    );
  });

  it("should translate the keyword using placeholder with doubleCurly option", () => {
    extend("en", {
      createItem: "Create New {{item}}",
    });

    setLocalizationConfigurations({
      defaultLocaleCode: "en",
      placeholderPattern: "doubleCurly",
    });

    expect(plainTrans("createItem", { item: "Category" })).toBe(
      "Create New Category",
    );
  });
  it("should translate the keyword using placeholder with custom RegEx", () => {
    extend("en", {
      createItem: "Create New /item/",
    });

    setLocalizationConfigurations({
      defaultLocaleCode: "en",
      placeholderPattern: /\/([^\/]+)\//g,
    });

    expect(plainTrans("createItem", { item: "Category" })).toBe(
      "Create New Category",
    );
  });

  it("should return same translation text if placeholder pattern is not written correctly", () => {
    extend("en", {
      createItem: "Create New :item",
    });

    setLocalizationConfigurations({
      defaultLocaleCode: "en",
      placeholderPattern: /\/([^\/]+)\//g,
    });

    expect(plainTrans("createItem", { item: "Category" })).toBe(
      "Create New :item",
    );
  });
});
