import { extend, plainTrans, setLocalizationConfigurations } from "../src";

describe("localization/count-based-translations", () => {
  beforeEach(() => {
    setLocalizationConfigurations({
      defaultLocaleCode: "en",
      fallback: "ar", // setting fallback to test cross-language fallbacks
    });
  });

  it("should handle all count cases with complete translations", () => {
    extend("en", {
      products_zero: "No products available",
      products_one: "One product in stock",
      products_two: "A pair of products",
      products_three: "A trio of products",
      products_many: "Many products (:count in stock)",
      products_other: ":count products",
    });

    expect(plainTrans("products", { count: 0 })).toBe("No products available");
    expect(plainTrans("products", { count: 1 })).toBe("One product in stock");
    expect(plainTrans("products", { count: 2 })).toBe("A pair of products");
    expect(plainTrans("products", { count: 3 })).toBe("A trio of products");
    expect(plainTrans("products", { count: 4 })).toBe(
      "Many products (4 in stock)",
    );
    expect(plainTrans("products", { count: 100 })).toBe(
      "Many products (100 in stock)",
    );
  });

  it("should handle negative numbers", () => {
    extend("en", {
      balance_negative: "Overdrawn by :count dollars",
      balance_zero: "Zero balance",
      balance_one: "One dollar remaining",
      balance_other: ":count dollars remaining",
    });

    expect(plainTrans("balance", { count: -5 })).toBe("Overdrawn by 5 dollars");
    expect(plainTrans("balance", { count: 0 })).toBe("Zero balance");
    expect(plainTrans("balance", { count: 1 })).toBe("One dollar remaining");
    expect(plainTrans("balance", { count: 5 })).toBe("5 dollars remaining");
  });

  it("should handle fallbacks between count cases", () => {
    extend("en", {
      items_one: "One item",
      items_other: ":count items",
    });

    // Should fall back to _other when specific count case is missing
    expect(plainTrans("items", { count: 0 })).toBe("0 items");
    expect(plainTrans("items", { count: 1 })).toBe("One item");
    expect(plainTrans("items", { count: 2 })).toBe("2 items");
    expect(plainTrans("items", { count: 3 })).toBe("3 items");
    expect(plainTrans("items", { count: 10 })).toBe("10 items");
  });

  it("should handle string numbers and type coercion", () => {
    extend("en", {
      views_zero: "No views yet",
      views_one: "First view",
      views_other: ":count views",
    });

    expect(plainTrans("views", { count: "0" })).toBe("No views yet");
    expect(plainTrans("views", { count: "1" })).toBe("First view");
    expect(plainTrans("views", { count: "5" })).toBe("5 views");
  });

  it("should fall back to default translation when no count cases exist", () => {
    extend("en", {
      message: "Default message (:count)",
    });

    expect(plainTrans("message", { count: 0 })).toBe("Default message (0)");
    expect(plainTrans("message", { count: 1 })).toBe("Default message (1)");
    expect(plainTrans("message", { count: 5 })).toBe("Default message (5)");
  });
});
