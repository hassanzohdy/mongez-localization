import { extend, plainTrans, setLocalizationConfigurations } from "../src";

describe("localization/plainTrans", () => {
  beforeEach(() => {
    setLocalizationConfigurations({
      defaultLocaleCode: "en",
      placeholderPattern: "colon",
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

  it("should translate the keyword using count-based translations", () => {
    extend("en", {
      products_zero: "No products",
      products_one: "One product",
      products_two: ":count products (pair)",
      products_three: ":count products (trio)",
      products_many: "Multiple products (:count)",
      products_other: ":count products",
      products: ":count products", // fallback
    });

    // Test all count cases
    expect(plainTrans("products", { count: 0 })).toBe("No products");
    expect(plainTrans("products", { count: 1 })).toBe("One product");
    expect(plainTrans("products", { count: 2 })).toBe("2 products (pair)");
    expect(plainTrans("products", { count: 3 })).toBe("3 products (trio)");
    expect(plainTrans("products", { count: 4 })).toBe("Multiple products (4)");
    expect(plainTrans("products", { count: 10 })).toBe(
      "Multiple products (10)",
    );

    // Test fallback to _other when specific case is missing
    extend("en", {
      items_one: ":count item",
      items_other: ":count items",
    });

    expect(plainTrans("items", { count: 0 })).toBe("0 items"); // falls back to _other
    expect(plainTrans("items", { count: 1 })).toBe("1 item");
    expect(plainTrans("items", { count: 2 })).toBe("2 items"); // falls back to _other

    // Test complete fallback when no count-specific translations exist
    expect(plainTrans("things", { count: 1 })).toBe("things");
  });
});
