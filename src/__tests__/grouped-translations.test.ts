import { beforeEach, describe, expect, it } from "vitest";
import { groupedTranslations, trans, transFrom } from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("groupedTranslations — keyword-first shape", () => {
  it("registers a top-level keyword with multiple locales", () => {
    groupedTranslations({
      home: { en: "Home", ar: "الرئيسية" },
    });
    expect(trans("home")).toBe("Home");
    expect(transFrom("ar", "home")).toBe("الرئيسية");
  });

  it("registers nested groups using dot-notation reads", () => {
    groupedTranslations({
      general: {
        home: { en: "Home", ar: "الرئيسية" },
        about: { en: "About", ar: "عنا" },
      },
    });
    expect(trans("general.home")).toBe("Home");
    expect(transFrom("ar", "general.about")).toBe("عنا");
  });
});

describe("groupedTranslations — with explicit group key", () => {
  it("prefixes every keyword with the group key", () => {
    groupedTranslations("store", {
      orders: { en: "Orders", ar: "الطلبات" },
      products: { en: "Products", ar: "المنتجات" },
    });
    expect(trans("store.orders")).toBe("Orders");
    expect(trans("store.products")).toBe("Products");
    expect(transFrom("ar", "store.orders")).toBe("الطلبات");
  });

  it("supports dot-notation group keys", () => {
    groupedTranslations("admin.users", {
      list: { en: "List", ar: "قائمة" },
    });
    expect(trans("admin.users.list")).toBe("List");
  });
});

describe("groupedTranslations + placeholders", () => {
  it("interpolates inside grouped translations", () => {
    groupedTranslations({
      user: {
        welcome: { en: "Welcome :name", ar: "مرحبا :name" },
      },
    });
    expect(trans("user.welcome", { name: "Ada" })).toBe("Welcome Ada");
    expect(transFrom("ar", "user.welcome", { name: "Ada" })).toBe(
      "مرحبا Ada",
    );
  });
});

describe("trans accepts an inline translation object", () => {
  it("picks the value matching the current locale", () => {
    const t = { home: { en: "Home", ar: "الرئيسية" } };
    expect(trans(t.home)).toBe("Home");
  });

  it("interpolates against an inline object too", () => {
    const t = { create: { en: "Create :item", ar: "إنشاء :item" } };
    expect(trans(t.create, { item: "Order" })).toBe("Create Order");
  });
});
