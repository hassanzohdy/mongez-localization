import { beforeEach, describe, expect, it } from "vitest";
import {
  extend,
  plainConverter,
  plainTrans,
  setLocalizationConfigurations,
  trans,
} from "..";
import { resetLocalization } from "./helpers";

beforeEach(() => {
  resetLocalization();
});

describe("plainConverter", () => {
  it("replaces colon-prefixed placeholders by default", () => {
    expect(plainConverter("Hello :name", { name: "Ada" })).toBe("Hello Ada");
  });

  it("replaces multiple placeholders in one string", () => {
    expect(
      plainConverter("Hi :first :last", { first: "Ada", last: "Lovelace" }),
    ).toBe("Hi Ada Lovelace");
  });

  it("stringifies number placeholders", () => {
    expect(plainConverter("Count: :n", { n: 42 })).toBe("Count: 42");
  });

  it("leaves a placeholder alone when no value is supplied for it", () => {
    expect(plainConverter("Hello :name :friend", { name: "Ada" })).toBe(
      "Hello Ada :friend",
    );
  });

  it("accepts a custom pattern argument", () => {
    expect(
      plainConverter(
        "Hello {{name}}",
        { name: "Ada" },
        /\{\{([a-zA-Z0-9_-]+)\}\}/g,
      ),
    ).toBe("Hello Ada");
  });

  it("returns the string untouched when placeholders is empty", () => {
    expect(plainConverter("Hello :name", {})).toBe("Hello :name");
  });
});

describe("trans / plainTrans with placeholders", () => {
  beforeEach(() => {
    extend("en", {
      create: "Create New :item",
      qtyOf: "You have :n :items",
    });
  });

  it("interpolates string placeholders", () => {
    expect(trans("create", { item: "Category" })).toBe("Create New Category");
  });

  it("interpolates several placeholders at once", () => {
    expect(trans("qtyOf", { n: 5, items: "books" })).toBe("You have 5 books");
  });

  it("plainTrans ignores the configured converter and uses the plain one", () => {
    // Replace the global converter with one that appends a marker — proves
    // plainTrans skips it.
    setLocalizationConfigurations({
      converter: (text: string, p: any) => `[${text}|${JSON.stringify(p)}]`,
    });
    expect(plainTrans("create", { item: "Order" })).toBe("Create New Order");
    expect(trans("create", { item: "Order" })).toBe(
      '[Create New :item|{"item":"Order"}]',
    );
  });
});

describe("placeholder pattern variants", () => {
  it("supports doubleCurly via the named alias", () => {
    setLocalizationConfigurations({ placeholderPattern: "doubleCurly" });
    extend("en", { greet: "Hi {{name}}" });
    expect(plainTrans("greet", { name: "Ada" })).toBe("Hi Ada");
  });

  it("supports a custom RegExp", () => {
    setLocalizationConfigurations({ placeholderPattern: /<([a-z]+)>/g });
    extend("en", { greet: "Hi <name>" });
    expect(plainTrans("greet", { name: "Ada" })).toBe("Hi Ada");
  });
});

describe("custom converters", () => {
  it("custom converter receives (translation, placeholders, pattern)", () => {
    let receivedArgs: unknown[] | null = null;
    setLocalizationConfigurations({
      converter: (text, placeholders, pattern) => {
        receivedArgs = [text, placeholders, pattern];
        return "OK";
      },
    });
    extend("en", { greet: "Hello :name" });
    expect(trans("greet", { name: "Ada" })).toBe("OK");
    expect(receivedArgs![0]).toBe("Hello :name");
    expect(receivedArgs![1]).toEqual({ name: "Ada" });
    expect(receivedArgs![2]).toBeInstanceOf(RegExp);
  });

  it("converter is only invoked when placeholders are passed", () => {
    let calls = 0;
    setLocalizationConfigurations({
      converter: (text: string) => {
        calls++;
        return text;
      },
    });
    extend("en", { hello: "Hello" });
    // No placeholders → converter skipped.
    expect(trans("hello")).toBe("Hello");
    expect(calls).toBe(0);
    // With placeholders → converter runs.
    trans("hello", { unused: "x" });
    expect(calls).toBe(1);
  });
});
