import { beforeEach, describe, expect, it } from "vitest";
import { extend, groupedTranslations } from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("prototype pollution — registry writers", () => {
  it("extend() does not pollute Object.prototype via a __proto__ keyword", () => {
    extend(
      "en",
      JSON.parse('{"__proto__":{"polluted":1}}'),
    );

    expect(({} as any).polluted).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "polluted")).toBe(false);
  });

  it("groupedTranslations() rejects a __proto__ keyword path", () => {
    groupedTranslations(
      JSON.parse('{"__proto__":{"x":{"en":"polluted"}}}'),
    );

    expect(({} as any).x).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "x")).toBe(false);
  });

  it("groupedTranslations() does not pollute Object.prototype via a constructor.prototype path", () => {
    groupedTranslations({
      constructor: { prototype: { polluted: { en: "yes" } } },
    } as any);

    expect(({} as any).polluted).toBeUndefined();
  });

  it("groupedTranslations() rejects dangerous locale and group segments", () => {
    groupedTranslations(JSON.parse('{"title":{"__proto__":"polluted"}}'));
    groupedTranslations("constructor", { title: { en: "polluted" } });

    expect(({} as any).title).toBeUndefined();
    expect(({} as any).polluted).toBeUndefined();
  });
});
