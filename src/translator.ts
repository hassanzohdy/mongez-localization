import { localizationEvents } from "./events";
import { Obj, vsprintf } from "@mongez/reinforcements";
import { GroupedTranslations, Keywords, TranslationsList } from "./types";

/**
 * Current locale code
 */
let currentLocaleCode: string;

/**
 * all keywords for all locale codes
 */
let translationsList: TranslationsList = {};

/**
 * Current fall back locale code
 */
let fallbackLocaleCode: string;

/**
 * Get current locale code
 *
 * @returns {string}
 */
export function getCurrentLocaleCode() {
  return currentLocaleCode;
}

/**
 * Set current locale code
 *
 * @param  {string} localeCode
 * @returns {void}
 */
export function setCurrentLocaleCode(localeCode: string): void {
  const oldLocaleCode: string = currentLocaleCode;
  currentLocaleCode = localeCode;
  localizationEvents.triggerChange("localeCode", localeCode, oldLocaleCode);
}

/**
 * Add keywords
 *
 * @param  {object} keywords
 * @returns {void}
 */
export function extend(localeCode: string, keywords: Keywords) {
  translationsList[localeCode] = Obj.merge(
    translationsList[localeCode] || {},
    keywords
  ) as Keywords;
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
  const oldFallback: string = fallbackLocaleCode;

  fallbackLocaleCode = fallbackLocale;
  localizationEvents.triggerChange("fallback", fallbackLocale, oldFallback);
}

/**
 * Translate the given keyword in current locale code
 *
 * @param   {string} keyword
 * @returns {any}
 */
export function trans(keyword: string, ...args: any[]) {
  return transFrom(currentLocaleCode, keyword, ...args);
}

/**
 * Create a grouped translations based on keyword, each keyword contains list of locale codes and beside it its corresponding translation
 * @param localeCode
 * @param keyword
 * @param args
 * @returns
 */
export function groupedTranslations(
  groupedTranslations: GroupedTranslations
): void {
  for (const keyword in groupedTranslations) {
    const translations = groupedTranslations[keyword];
    for (const localeCode in translations) {
      if (!translationsList[localeCode]) {
        translationsList[localeCode] = {};
      }

      translationsList[localeCode][keyword] = translations[localeCode];
    }
  }
}

/**
 * Translate the given keyword for the given locale code
 *
 * Please note this method accepts dot notation syntax
 *
 * @param   {string} key
 * @returns {any}
 */
export function transFrom(localeCode: string, keyword: string, ...args: any[]) {
  let translation =
    Obj.get(translationsList, `${localeCode}.${keyword}`) ||
    (fallbackLocaleCode
      ? Obj.get(translationsList, `${fallbackLocaleCode}.${keyword}`)
      : null);

  return translation ? vsprintf(translation, args) || keyword : keyword;
}
