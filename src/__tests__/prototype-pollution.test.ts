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

  it("groupedTranslations() does not pollute Object.prototype via a __proto__ keyword", () => {
    groupedTranslations({
      __proto__: { x: { en: "polluted" } },
    } as any);

    expect(({} as any).x).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "x")).toBe(false);
  });

  it("groupedTranslations() does not pollute Object.prototype via a constructor.prototype path", () => {
    groupedTranslations({
      constructor: { prototype: { polluted: { en: "yes" } } },
    } as any);

    expect(({} as any).polluted).toBeUndefined();
  });
});
