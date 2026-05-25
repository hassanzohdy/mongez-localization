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

/**
 * Count rule function type
 */
export type CountRuleFunction = (count: number) => boolean;

/**
 * Count rules for a specific language
 */
export type LanguageCountRules = {
  [key: string]: CountRuleFunction;
};

/**
 * Count rules configuration
 */
export type CountRulesConfig = {
  [localeCode: string]: LanguageCountRules;
};

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
  /**
   * Custom count rules for each locale
   */
  countRules?: CountRulesConfig;
  /**
   * Range-based count configuration
   */
  countRanges?: {
    /**
     * Whether to enable range-based count rules
     * @default false
     */
    enabled?: boolean;
    /**
     * Range separator for translation keys
     * @default "_"
     */
    separator?: string;
    /**
     * Custom range thresholds as an array of `[min, max]` tuples.
     * Use `Infinity` as the max for an open-ended bucket (rendered as `plus` in the key).
     *
     * @default [[0, 5], [6, 20], [21, Infinity]]
     */
    ranges?: Array<[number, number]>;
  };
  /**
   * Resolve locale code that will be used to fetch the translation when calling `trans` function
   *
   * @default return value of `getCurrentLocaleCode()`
   */
  translationLocaleCode?: string;
  /**
   * @deprecated Misspelled — use `translationLocaleCode` instead.
   * Kept for backward compatibility; will be removed in a future major release.
   */
  translationLocalCode?: string;
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
