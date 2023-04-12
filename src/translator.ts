import { get, merge, set } from "@mongez/reinforcements";
import { plainConverter } from "./converters";
import { localizationEvents } from "./events";
import {
  Converter,
  GroupedTranslations,
  Keywords,
  Translatable,
  TranslationsList,
} from "./types";

/**
 * Current locale code
 */
let currentLocaleCode: string = "en";

/**
 * Current converter
 */
let currentConverter: Converter = plainConverter;

/**
 * all keywords for all locale codes
 */
let translationsList: TranslationsList = {};

/**
 * Current fall back locale code
 */
let fallbackLocaleCode: string = "en";

/**
 * Get current locale code
 */
export function getCurrentLocaleCode() {
  return currentLocaleCode;
}

/**
 * Get fallback locale code
 */
export function getFallbackLocaleCode() {
  return fallbackLocaleCode;
}

/**
 * Set current converter
 */
export function setConverter(converter: Converter) {
  currentConverter = converter;
}

/**
 * Set current locale code
 */
export function setCurrentLocaleCode(localeCode: string): void {
  const oldLocaleCode = currentLocaleCode;
  currentLocaleCode = localeCode;
  localizationEvents.triggerChange("localeCode", localeCode, oldLocaleCode);
}

/**
 * Add keywords
 */
export function extend(localeCode: string, keywords: Keywords) {
  translationsList[localeCode] = merge(
    translationsList[localeCode] || {},
    keywords,
  ) as Keywords;
}

/**
 * Create a grouped translations based on keyword, each keyword contains list of locale codes and beside it its corresponding translation
 */
export function groupedTranslations(
  groupKey?: string | GroupedTranslations,
  groupedTranslations?: GroupedTranslations,
): void {
  if (typeof groupKey !== "string" && !groupedTranslations) {
    groupedTranslations = groupKey;
    groupKey = undefined;
  }

  for (const keyword in groupedTranslations) {
    const translations = groupedTranslations[keyword];
    for (const localeCode in translations) {
      if (!translationsList[localeCode]) {
        translationsList[localeCode] = {};
      }

      if (groupKey) {
        set(
          translationsList,
          `${localeCode}.${groupKey}.${keyword}`,
          translations[localeCode],
        );
      } else {
        translationsList[localeCode][keyword] = translations[localeCode];
      }
    }
  }
}

/**
 * Override the entire translations list
 */
export function setTranslationsList(translations: TranslationsList): void {
  translationsList = translations;
}

/**
 * Get the entire translations list
 */
export function getTranslationsList(): TranslationsList {
  return translationsList;
}

/**
 * Get the keywords list of the given locale code
 */
export function getKeywordsListOf(localeCode: string): Keywords | null {
  return translationsList[localeCode] || null;
}

/**
 * Set fallback locale code, if the keyword does not exist on current locale code,
 * then check it in the faLLBACK locale code instead
 */
export function setFallbackLocaleCode(fallbackLocale: string) {
  const oldFallback = fallbackLocaleCode;

  fallbackLocaleCode = fallbackLocale;
  localizationEvents.triggerChange("fallback", fallbackLocale, oldFallback);
}

/**
 * Translate the given keyword in current locale code
 */
export function trans(
  keyword: Translatable,
  placeholders?: any,
  converter: Converter = currentConverter,
) {
  return transFrom(currentLocaleCode, keyword, placeholders, converter);
}

/**
 * Translate using the default converter
 */
export function plainTrans(keyword: string, placeholders?: any) {
  return transFrom(currentLocaleCode, keyword, placeholders, plainConverter);
}

/**
 * Translate the given keyword for the given locale code
 * Please note this method accepts dot notation syntax
 */
export function transFrom(
  localeCode: string,
  keyword: Translatable,
  placeholders?: any,
  converter = currentConverter,
) {
  let translation;
  if (typeof keyword === "object") {
    translation = keyword[localeCode] || keyword[fallbackLocaleCode];
  } else {
    translation =
      get(translationsList, `${localeCode}.${keyword}`) ||
      (fallbackLocaleCode
        ? get(translationsList, `${fallbackLocaleCode}.${keyword}`)
        : null);
  }

  if (!translation) return keyword;

  return placeholders ? converter(translation, placeholders) : translation;
}

export type WithPlaceholder<T> = {
  p: (keyword: keyof T, placeholders?: any) => string;
  plain: (keyword: keyof T, placeholders?: any) => string;
};

/**
 * Get a translation object with automatic translation using object syntax
 * Please note this does not support nested objects, only keywords and their translations
 * i.e
 * const translations = transObject({
 *  name: {
 *     en: 'name',
 *    ar: 'الاسم'
 * }
 * });
 *
 * Usage: translations.name // returns the name in current locale code
 * If the keyword does not exist on current locale code, then it will check it in the fallback locale code
 *
 * If keyword is "p", then it will return a function that accepts keyword and its placeholders
 * If keyword is "plain", then the converter used in translation will be the plain converter
 */
export function transObject<T extends Keywords>(translations: T) {
  // use proxy
  return new Proxy(translations as any, {
    get(target, key: string) {
      if (key === "p") {
        return function (keyword: keyof T, placeholders?: any) {
          return transFrom(
            currentLocaleCode,
            target[keyword] as Translatable,
            placeholders,
            currentConverter,
          );
        };
      }

      if (key === "plain") {
        return function (keyword: keyof T, placeholders?: any) {
          return transFrom(
            currentLocaleCode,
            target[keyword] as Translatable,
            placeholders,
            plainConverter,
          );
        };
      }

      if (!target[key]) return transFrom(fallbackLocaleCode, key as string);

      return transFrom(currentLocaleCode, target[key] as Translatable);
    },
  }) as WithPlaceholder<T> & {
    [key in keyof T]: string;
  };
}
