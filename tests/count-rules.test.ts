import { extend, plainTrans, setLocalizationConfigurations } from "../src";

describe("localization/advanced-count-rules", () => {
  beforeEach(() => {
    setLocalizationConfigurations({
      defaultLocaleCode: "en",
    });
  });

  it("should handle custom count rules for Arabic", () => {
    setLocalizationConfigurations({
      defaultLocaleCode: "ar",
      countRules: {
        ar: {
          zero: n => n === 0,
          one: n => n === 1,
          two: n => n === 2,
          few: n => n % 100 >= 3 && n % 100 <= 10,
          many: n => n % 100 >= 11,
          other: () => true,
        },
      },
    });

    extend("ar", {
      items_zero: "لا يوجد عناصر",
      items_one: "عنصر واحد",
      items_two: "عنصران",
      items_few: ":count عناصر",
      items_many: ":count عنصراً",
      items_other: ":count عنصر",
    });

    expect(plainTrans("items", { count: 0 })).toBe("لا يوجد عناصر");
    expect(plainTrans("items", { count: 1 })).toBe("عنصر واحد");
    expect(plainTrans("items", { count: 2 })).toBe("عنصران");
    expect(plainTrans("items", { count: 5 })).toBe("5 عناصر");
    expect(plainTrans("items", { count: 11 })).toBe("11 عنصراً");
    expect(plainTrans("items", { count: 100 })).toBe("100 عنصر");
  });

  it("should handle range-based translations", () => {
    setLocalizationConfigurations({
      defaultLocaleCode: "en",
      countRanges: {
        enabled: true,
      },
    });

    extend("en", {
      people_range_0_5: "Small group (:count people)",
      people_range_6_20: "Medium group (:count people)",
      people_range_21_plus: "Large group (:count people)",
    });

    expect(plainTrans("people", { count: 3 })).toBe("Small group (3 people)");
    expect(plainTrans("people", { count: 15 })).toBe(
      "Medium group (15 people)",
    );
    expect(plainTrans("people", { count: 50 })).toBe("Large group (50 people)");
  });
});
