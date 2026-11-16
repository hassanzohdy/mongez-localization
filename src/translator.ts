import { flatten, get, merge, set } from "@mongez/reinforcements";
import { getLocalizationConfigurations } from "./config";
import { plainConverter } from "./converters";
import { formatCount, getCountKey } from "./count-rules";
import { localizationEvents } from "./events";
import { getPlaceholderPattern } from "./placeholder-pattern-config";
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

const dangerousTranslationPathSegments = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);

function isSafeTranslationPath(segments: string[]): boolean {
  return segments.every(
    segment => !dangerousTranslationPathSegments.has(segment),
  );
}

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
 * Get the locale code used in translation, this allows to get the locale code on the fly
 */
export function getTranslationLocaleCode(): string {
  const config = getLocalizationConfigurations();
  // Prefer the correctly-spelled key; fall back to the legacy misspelling for backward compat.
  return (
    config.translationLocaleCode ||
    config.translationLocalCode ||
    currentLocaleCode
  );
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
 *
 * @example
 * {
 *  home: {
 *    en: "Home",
 *    ar: "الرئيسية"
 *  }
 * }
 *
 * Also it could have nested grouped translations
 *
 * @example
 * {
 *  general: {
 *    home: {
 *      en: "Home",
 *      ar: "الرئيسية"
 *    }
 *  }
 */
export function groupedTranslations(
  groupKey?: string | GroupedTranslations,
  groupedTranslations?: GroupedTranslations,
): void {
  if (typeof groupKey !== "string" && !groupedTranslations) {
    groupedTranslations = groupKey;
    groupKey = undefined;
  }

  // now we need to loop over the grouped translations
  // we have two cases here
  // first one we have a group key
  // second one we don't have a group key
  // as values are always objects until the last level
  // we need to create a recursive function to loop over the object

  // output of the flatten object will be something like:
  // general.home.en: "Home"
  // general.home.ar: "الرئيسية"
  const object = flatten(
    groupKey && typeof groupKey === "string"
      ? { [groupKey]: groupedTranslations }
      : groupedTranslations,
  );

  // now the locale codes are the last dot in each key
  // now we will loop over the object and add each key to the translations list
  for (const key in object) {
    const keyword = key.split(".");
    const localeCode = keyword.pop();

    // `set` follows dot notation through regular objects. Never pass a path
    // containing prototype-mutating segments into it, whether that segment
    // originated in the locale, a group name, or a keyword.
    if (!localeCode || !isSafeTranslationPath([localeCode, ...keyword])) {
      continue;
    }

    set(translationsList, localeCode + "." + keyword.join("."), object[key]);
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
  return transFrom(
    getTranslationLocaleCode(),
    keyword,
    placeholders,
    converter,
  );
}

/**
 * Translate using the default converter
 */
export function plainTrans(keyword: string, placeholders?: any) {
  return transFrom(
    getTranslationLocaleCode(),
    keyword,
    placeholders,
    plainConverter,
  );
}

type TranslationLookup = (localeCode: string, keyword: string) => any;

type ResolvedTranslation = {
  translation: any;
  placeholders: any;
};

function hasTranslation(
  translation: any,
  preserveEmptyTranslations: boolean,
): boolean {
  return preserveEmptyTranslations
    ? translation !== undefined && translation !== null
    : Boolean(translation);
}

/**
 * Resolve a string keyword through the supplied locale lookup.
 *
 * The fallback lookup is optional so consumers with a complete, scoped
 * dictionary can resolve only the selected locale without consulting the
 * global translations list.
 */
function resolveStringTranslation(
  localeCode: string,
  keyword: string,
  placeholders: any,
  lookup: TranslationLookup,
  fallbackLookup?: TranslationLookup,
  preserveEmptyTranslations = false,
): ResolvedTranslation {
  let translation;

  if (placeholders?.count !== undefined) {
    const count = Number(placeholders.count);
    const fallback =
      fallbackLookup && fallbackLocaleCode
        ? { code: fallbackLocaleCode, lookup: fallbackLookup }
        : undefined;

    // Order: current locale's count variant, current locale's `_other`, then the
    // fallback locale's count variant and `_other`, then the bare keyword. A locale
    // that defines only `_other` therefore wins over the fallback's `_one`.
    const attempts: Array<() => any> = [
      () => lookup(localeCode, `${keyword}${getCountKey(count, localeCode)}`),
      () => lookup(localeCode, `${keyword}_other`),
    ];

    if (fallback) {
      attempts.push(
        () =>
          fallback.lookup(
            fallback.code,
            `${keyword}${getCountKey(count, fallback.code)}`,
          ),
        () => fallback.lookup(fallback.code, `${keyword}_other`),
      );
    }

    attempts.push(() => lookup(localeCode, keyword));

    if (fallback) {
      attempts.push(() => fallback.lookup(fallback.code, keyword));
    }

    for (const attempt of attempts) {
      translation = attempt();

      if (hasTranslation(translation, preserveEmptyTranslations)) break;
    }

    // Keep the existing behavior: format the count only after resolving a
    // translation, and pass the absolute value to the configured converter.
    if (
      hasTranslation(translation, preserveEmptyTranslations) &&
      placeholders.count !== undefined
    ) {
      placeholders = { ...placeholders, count: formatCount(count) };
    }
  } else {
    translation = lookup(localeCode, keyword);

    if (
      !hasTranslation(translation, preserveEmptyTranslations) &&
      fallbackLookup &&
      fallbackLocaleCode
    ) {
      translation = fallbackLookup(fallbackLocaleCode, keyword);
    }
  }

  return { translation, placeholders };
}

function convertTranslation(
  translation: any,
  keyword: Translatable,
  placeholders: any,
  converter: Converter,
  preserveEmptyTranslations = false,
) {
  if (!hasTranslation(translation, preserveEmptyTranslations)) return keyword;

  return placeholders
    ? converter(translation, placeholders, getPlaceholderPattern())
    : translation;
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
  if (typeof keyword === "object") {
    return convertTranslation(
      keyword[localeCode] || keyword[fallbackLocaleCode],
      keyword,
      placeholders,
      converter,
    );
  }

  const resolved = resolveStringTranslation(
    localeCode,
    keyword,
    placeholders,
    (translationLocaleCode, translationKeyword) =>
      get(translationsList, `${translationLocaleCode}.${translationKeyword}`),
    (translationLocaleCode, translationKeyword) =>
      get(translationsList, `${translationLocaleCode}.${translationKeyword}`),
  );

  return convertTranslation(
    resolved.translation,
    keyword,
    resolved.placeholders,
    converter,
  );
}

/**
 * Translate from a selected locale's keyword bag without reading the global
 * translations list or the configured fallback locale for string keywords.
 * Inline translation objects retain the same locale/fallback behavior as
 * `transFrom`.
 */
export function transFromKeywords(
  localeCode: string,
  keywords: Keywords,
  keyword: Translatable,
  placeholders?: any,
  converter: Converter = currentConverter,
) {
  if (typeof keyword !== "string") {
    return transFrom(localeCode, keyword, placeholders, converter);
  }

  const resolved = resolveStringTranslation(
    localeCode,
    keyword,
    placeholders,
    (_translationLocaleCode, translationKeyword) =>
      get(keywords, translationKeyword),
    undefined,
    true,
  );

  return convertTranslation(
    resolved.translation,
    keyword,
    resolved.placeholders,
    converter,
    true,
  );
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
