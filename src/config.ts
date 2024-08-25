import { get, merge } from "@mongez/reinforcements";
import {
  placeholderPatterns,
  setPlaceholderPattern,
} from "./placeholder-pattern-config";
import {
  setConverter,
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  setTranslationsList,
} from "./translator";
import { LocalizationConfigurations } from "./types";

let localesConfig: LocalizationConfigurations = {};

/**
 * Initiate localization configurations
 */
export function setLocalizationConfigurations(
  configurationsList: LocalizationConfigurations,
) {
  localesConfig = merge(localesConfig, configurationsList);

  if (configurationsList.translations) {
    setTranslationsList(configurationsList.translations);
  }

  if (configurationsList.converter) {
    setConverter(configurationsList.converter);
  }

  if (configurationsList.fallback) {
    setFallbackLocaleCode(configurationsList.fallback);
  }

  if (configurationsList.defaultLocaleCode) {
    setCurrentLocaleCode(configurationsList.defaultLocaleCode);
  }

  if (configurationsList.placeholderPattern) {
    setPlaceholderPattern(
      typeof configurationsList.placeholderPattern === "string"
        ? placeholderPatterns[configurationsList.placeholderPattern]
        : configurationsList.placeholderPattern,
    );
  }
}

/**
 * Get current localization configurations list
 */
export function getLocalizationConfigurations(): LocalizationConfigurations {
  return localesConfig;
}

/**
 * Get single value of the localization configurations list
 */
export function getLocaleConfig(
  key: keyof LocalizationConfigurations,
  defaultValue: any = null,
): any {
  return get(localesConfig, key, defaultValue);
}
