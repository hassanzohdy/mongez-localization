import { extend, plainTrans, setLocalizationConfigurations } from "../src";

describe("localization/plainTrans", () => {
  beforeAll(() => {
    extend("en", {
      createItem: "Create New :item",
      hello: "Hello World",
    });

    extend("ar", {
      hello: "أهلا بكم",
    });

    extend("alien", {
      fallbackKeyword: "Hola",
    });
  });

  beforeEach(() => {
    setLocalizationConfigurations({
      defaultLocaleCode: "en",
    });
  });

  it("should translate the keyword using plain converter", () => {
    expect(plainTrans("hello")).toBe("Hello World");
  });

  it("should translate the keyword using placeholder", () => {
    expect(plainTrans("createItem", { item: "Category" })).toBe(
      "Create New Category",
    );
  });

  it("should should return the same keyword if missing in translation list", () => {
    expect(plainTrans("missingKeyword")).toBe("missingKeyword");
  });

  it("should return the translation from fallback locale code if keyword is missing in current locale code", () => {
    setLocalizationConfigurations({
      fallback: "alien",
    });

    expect(plainTrans("fallbackKeyword")).toBe("Hola");
  });
});
