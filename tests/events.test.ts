import { localizationEvents } from "src/events";
import { setCurrentLocaleCode, setFallbackLocaleCode } from "src/translator";

describe("localization/events", () => {
  it("should listen to the locale code change", () => {
    localizationEvents.onChange(
      "localeCode",
      (newLocaleCode, oldLocaleCode) => {
        expect(newLocaleCode).toBe("ar");
        expect(oldLocaleCode).toBe("en");
      },
    );

    setCurrentLocaleCode("ar");
  });

  it("should listen to the fallback locale code change", () => {
    localizationEvents.onChange("fallback", (newLocaleCode, oldLocaleCode) => {
      expect(newLocaleCode).toBe("ar");
      expect(oldLocaleCode).toBe("en");
    });

    setFallbackLocaleCode("ar");
  });
});
