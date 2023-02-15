import { groupedTranslations, trans, transFrom } from "../src";

describe("localization/groupedTranslations", () => {
  it("should group translations by keyword", () => {
    groupedTranslations({
      home: {
        en: "Home",
        ar: "الرئيسية",
      },
    });

    expect(trans("home")).toBe("Home");
  });

  it("should group multiple keywords with a group key", () => {
    groupedTranslations("general", {
      home: {
        en: "Home",
        ar: "الرئيسية",
      },
      about: {
        en: "About",
        ar: "عنا",
      },
    });

    expect(trans("general.home")).toBe("Home");
    expect(transFrom("ar", "general.home")).toBe("الرئيسية");
  });
});
