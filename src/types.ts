export type TranslationsList = {
  [localeCode: string]: Keywords;
};

export type Keywords = {
  [key: string]: string | Keywords;
};

export type LocaleCodeChangeCallback = (
  newLocaleCode: string,
  oldLocaleCode: string
) => void;

export type LocalizationEventName = "localeCode" | "fallback";

export type LocalizationConfigurations = {
  /**
   * Default locale code
   */
  defaultLocaleCode?: string;
  /**
   * Fall back locale code
   */
  fallback?: string;
  /**
   * Set translations list
   */
  translations?: TranslationsList;
};

export type GroupedTranslations = {
  [keyword: string]: {
    [localeCode: string]: string;
  };
};
