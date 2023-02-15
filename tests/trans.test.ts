import {
  extend,
  setLocalizationConfigurations,
  trans,
  transFrom,
} from "../src";

describe("localization/trans", () => {
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

  it("should translate the keyword", () => {
    expect(trans("hello")).toBe("Hello World");
  });

  it("should translate the keyword using placeholder", () => {
    expect(trans("createItem", { item: "Category" })).toBe(
      "Create New Category",
    );
  });

  it("should should return the same keyword if missing in translation list", () => {
    expect(trans("missingKeyword")).toBe("missingKeyword");
  });

  it("should return the translation from fallback locale code if keyword is missing in current locale code", () => {
    setLocalizationConfigurations({
      fallback: "alien",
    });

    expect(trans("fallbackKeyword")).toBe("Hola");
  });

  it("should translate from the given localeCode", () => {
    expect(transFrom("ar", "hello")).toBe("أهلا بكم");
    expect(transFrom("en", "hello")).toBe("Hello World");
  });

  it("should get proper translation keyword based on current locale code from translation object key", () => {
    const translation = {
      welcomeHome: {
        en: "Welcome home",
        ar: "مرحبا بكم",
      },
    };

    expect(trans(translation.welcomeHome)).toBe("Welcome home");
  });

  it("should get proper translation keyword based on given locale code from translation object key", () => {
    const translation = {
      welcomeHome: {
        en: "Welcome home",
        ar: "مرحبا بكم",
      },
    };

    expect(transFrom("ar", translation.welcomeHome)).toBe("مرحبا بكم");
  });

  it("should use locale callback to translate the keyword from the given object", () => {
    const translations = {
      home: {
        en: "Home",
        ar: "الرئيسية",
      },
    };

    setLocalizationConfigurations({
      fallback: "ar",
    });

    expect(transFrom("fr", translations.home)).toBe("الرئيسية");
  });
});
