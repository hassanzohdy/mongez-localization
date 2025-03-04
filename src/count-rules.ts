import { getLocalizationConfigurations } from "./config";
import { LanguageCountRules } from "./types";

/**
 * Default count rules for English
 */
const defaultCountRules: LanguageCountRules = {
  negative: (n: number) => n < 0,
  zero: (n: number) => n === 0,
  one: (n: number) => n === 1,
  two: (n: number) => n === 2,
  three: (n: number) => n === 3,
  many: (n: number) => n > 3,
  other: () => true,
};

/**
 * Arabic count rules
 * Following Arabic plural rules: zero, one, two, few (3-10), many (11+), other
 */
const arabicCountRules: LanguageCountRules = {
  negative: (n: number) => n < 0,
  zero: (n: number) => n === 0,
  one: (n: number) => n === 1,
  two: (n: number) => n === 2,
  few: (n: number) => {
    const mod100 = Math.abs(n) % 100;
    return mod100 >= 3 && mod100 <= 10;
  },
  many: (n: number) => {
    const mod100 = Math.abs(n) % 100;
    return mod100 >= 11 && mod100 <= 99;
  },
  other: () => true,
};

/**
 * Built-in count rules for common languages
 */
const builtInRules = {
  en: defaultCountRules,
  ar: arabicCountRules,
};

/**
 * Get count rules for the given locale code
 */
export function getCountRules(localeCode: string): LanguageCountRules {
  const config = getLocalizationConfigurations();

  // Check for custom rules in config
  if (config.countRules?.[localeCode]) {
    return config.countRules[localeCode];
  }

  // Check for built-in rules
  if (builtInRules[localeCode]) {
    return builtInRules[localeCode];
  }

  // Fallback to default rules
  return defaultCountRules;
}

/**
 * Get the appropriate count key suffix based on the count value and locale rules
 */
export function getCountKey(count: number, localeCode: string): string {
  const rules = getCountRules(localeCode);
  const config = getLocalizationConfigurations();
  const absCount = Math.abs(count);

  // Handle negative numbers first
  if (count < 0 && typeof rules.negative === 'function') {
    return "_negative";
  }

  // Handle range-based counts if enabled
  if (config.countRanges?.enabled) {
    const separator = config.countRanges.separator || "_";
    
    // Check for range-based translations
    const ranges = [
      { min: 0, max: 5, key: "0_5" },
      { min: 6, max: 20, key: "6_20" },
      { min: 21, max: Infinity, key: "21_plus" }
    ];

    for (const range of ranges) {
      if (absCount >= range.min && absCount <= range.max) {
        return `_range_${range.min}_${range.max === Infinity ? 'plus' : range.max}`;
      }
    }
  }

  // Apply regular count rules
  for (const [key, rule] of Object.entries(rules)) {
    if (key !== 'negative' && rule(absCount)) {
      return `_${key}`;
    }
  }

  return "_other";
}

/**
 * Format count value based on configuration
 */
export function formatCount(count: number): string | number {
  return Math.abs(count);
}
