import { beforeEach, describe, expect, it } from "vitest";
import {
  extend,
  plainTrans,
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  setLocalizationConfigurations,
} from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("count suffixes — English defaults", () => {
  beforeEach(() => {
    extend("en", {
      products_zero: "No products",
      products_one: "One product",
      products_two: "Two products",
      products_three: "Three products",
      products_many: "Many products (:count)",
      products_other: ":count products",
    });
  });

  it("zero / one / two / three pick exact-count keys", () => {
    expect(plainTrans("products", { count: 0 })).toBe("No products");
    expect(plainTrans("products", { count: 1 })).toBe("One product");
    expect(plainTrans("products", { count: 2 })).toBe("Two products");
    expect(plainTrans("products", { count: 3 })).toBe("Three products");
  });

  it("counts > 3 pick the _many key", () => {
    expect(plainTrans("products", { count: 4 })).toBe("Many products (4)");
    expect(plainTrans("products", { count: 999 })).toBe("Many products (999)");
  });
});

describe("count suffixes — fallback to _other", () => {
  beforeEach(() => {
    // Only one and other defined; everything else should drop to _other.
    extend("en", {
      items_one: "One item",
      items_other: ":count items",
    });
  });

  it("count 0 falls back to _other when _zero is missing", () => {
    expect(plainTrans("items", { count: 0 })).toBe("0 items");
  });

  it("count 1 still picks _one", () => {
    expect(plainTrans("items", { count: 1 })).toBe("One item");
  });

  it("counts > 1 without _many fall through to _other", () => {
    expect(plainTrans("items", { count: 5 })).toBe("5 items");
  });
});

describe("count suffixes — negative numbers", () => {
  it("picks _negative when count < 0", () => {
    extend("en", {
      balance_negative: "Overdrawn by :count",
      balance_zero: "Zero balance",
      balance_other: ":count remaining",
    });
    // formatCount uses Math.abs, so the displayed count is positive.
    expect(plainTrans("balance", { count: -5 })).toBe("Overdrawn by 5");
    expect(plainTrans("balance", { count: 0 })).toBe("Zero balance");
    expect(plainTrans("balance", { count: 5 })).toBe("5 remaining");
  });
});

describe("count suffixes — coercion", () => {
  it("accepts string counts via Number() coercion", () => {
    extend("en", {
      views_zero: "No views yet",
      views_one: "First view",
      views_other: ":count views",
    });
    expect(plainTrans("views", { count: "0" })).toBe("No views yet");
    expect(plainTrans("views", { count: "1" })).toBe("First view");
    expect(plainTrans("views", { count: "5" })).toBe("5 views");
  });
});

describe("count suffixes — no count-tagged variants at all", () => {
  it("falls back to the bare keyword and interpolates :count", () => {
    extend("en", { msg: "Default (:count)" });
    expect(plainTrans("msg", { count: 0 })).toBe("Default (0)");
    expect(plainTrans("msg", { count: 9 })).toBe("Default (9)");
  });

  it("returns the keyword itself when nothing exists in any locale", () => {
    expect(plainTrans("never-defined", { count: 1 })).toBe("never-defined");
  });
});

describe("count suffixes — cross-locale fallback", () => {
  it("uses the fallback locale's count variants when current locale has none", () => {
    extend("en", {
      apples_one: "One apple",
      apples_other: ":count apples",
    });
    setCurrentLocaleCode("ar");
    setFallbackLocaleCode("en");
    expect(plainTrans("apples", { count: 1 })).toBe("One apple");
    expect(plainTrans("apples", { count: 5 })).toBe("5 apples");
  });
});

describe("custom count rules per locale", () => {
  it("custom rules take priority over the built-in defaults", () => {
    setLocalizationConfigurations({
      countRules: {
        en: {
          // Only "lots" and "other" — bypasses default _zero/_one/_two/_three.
          lots: n => n >= 10,
          other: () => true,
        },
      },
    });
    extend("en", {
      books_lots: "Many books (:count)",
      books_other: ":count book(s)",
    });
    expect(plainTrans("books", { count: 1 })).toBe("1 book(s)");
    expect(plainTrans("books", { count: 9 })).toBe("9 book(s)");
    expect(plainTrans("books", { count: 12 })).toBe("Many books (12)");
  });
});

describe("Arabic built-in rules", () => {
  beforeEach(() => {
    setCurrentLocaleCode("ar");
    extend("ar", {
      fruits_zero: "لا فواكه",
      fruits_one: "فاكهة",
      fruits_two: "فاكهتان",
      fruits_few: ":count فواكه",
      fruits_many: ":count فاكهة",
      fruits_other: ":count فاكهة (other)",
    });
  });

  it("zero / one / two map exactly", () => {
    expect(plainTrans("fruits", { count: 0 })).toBe("لا فواكه");
    expect(plainTrans("fruits", { count: 1 })).toBe("فاكهة");
    expect(plainTrans("fruits", { count: 2 })).toBe("فاكهتان");
  });

  it("3-10 maps to _few", () => {
    expect(plainTrans("fruits", { count: 3 })).toBe("3 فواكه");
    expect(plainTrans("fruits", { count: 7 })).toBe("7 فواكه");
    expect(plainTrans("fruits", { count: 10 })).toBe("10 فواكه");
  });

  it("11-99 maps to _many", () => {
    expect(plainTrans("fruits", { count: 11 })).toBe("11 فاكهة");
    expect(plainTrans("fruits", { count: 50 })).toBe("50 فاكهة");
  });
});
