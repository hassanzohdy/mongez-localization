/**
 * Translation list
 * Key is locale code and its corresponding value is an object of keywords list
 */
export type TranslationsList = {
  [localeCode: string]: Keywords;
};

/**
 * Converter type
 */
export type Converter = (
  keyword: string,
  placeholders: any,
  placeholderPattern: RegExp,
) => any;

/**
 * Translation keywords list
 * key is the common key that will be used among different languages
 * its value is either a string or another list of keywords a.k.a an object.
 */
export type Keywords = {
  [key: string]: string | Keywords;
};

/**
 * A callback that can be called when locale code is changed
 */
export type LocaleCodeChangeCallback = (
  newLocaleCode: string,
  oldLocaleCode: string,
) => void;

/**
 * Available event names list
 */
export type LocalizationEventName = "localeCode" | "fallback";

export type LocalizationConfigurations = {
  /**
   * Default locale code
   *
   * @default en
   */
  defaultLocaleCode?: string;
  /**
   * Fall back locale code
   *
   * @default en
   */
  fallback?: string;
  /**
   * Set translations list
   */
  translations?: TranslationsList;
  /**
   * Set placeholder converter
   */
  converter?: Converter;
  /**
   * Set placeholder pattern
   *
   * @default colon
   */
  placeholderPattern?: "colon" | "doubleCurly" | RegExp;
};

/**
 * Grouped translation structure
 * keyword is the key and its corresponding value is an object, each key of it represents locale code and its value is the translation
 */
export type GroupedTranslations = {
  [keyword: string]: GroupedTranslations | string;
};

/**
 * Translatable type
 */
export type Translatable =
  | string
  | {
      [localeCode: string]: string;
    };
