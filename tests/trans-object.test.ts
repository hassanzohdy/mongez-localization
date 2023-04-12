import { setLocalizationConfigurations, transObject } from "../src";

describe("localization/transObject", () => {
  beforeEach(() => {
    setLocalizationConfigurations({
      defaultLocaleCode: "en",
    });
  });

  it("should generate translation object for the given keywords", () => {
    const translations = transObject({
      name: {
        en: "name",
        ar: "الاسم",
      },
      email: {
        en: "email",
        ar: "البريد الإلكتروني",
      },
    });

    expect(translations.name).toBe("name");
    expect(translations.email).toBe("email");
  });

  it("should return same keyword if missing in translation list", () => {
    const translations = transObject({
      name: {
        en: "name",
        ar: "الاسم",
      },
      email: {
        en: "email",
        ar: "البريد الإلكتروني",
      },
    });

    expect(translations["missingKeyword"]).toBe("missingKeyword");
  });

  it("should use placeholder function that receives keyword and its placeholder", () => {
    const translations = transObject({
      welcome: {
        en: "Hello :name",
        ar: "مرحبا :name",
      },
    });

    expect(translations.p("welcome", { name: "Ahmed" })).toBe("Hello Ahmed");
  });

  it('should use "plain" property to access plain converter', () => {
    const translations = transObject({
      welcome: {
        en: "Hello :name",
        ar: "مرحبا :name",
      },
    });

    expect(translations.plain("welcome", { name: "Ahmed" })).toBe(
      "Hello Ahmed",
    );
  });
});
