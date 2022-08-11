import { Obj } from "@mongez/reinforcements";
import { LocalizationConfigurations } from "./types";
import {
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  setTranslationsList,
} from "./translator";

let localesConfig: LocalizationConfigurations = {};

/**
 * Initiate localization configurations
 */
export function setLocalizationConfigurations(
  configurationsList: LocalizationConfigurations
) {
  localesConfig = Obj.merge(localesConfig, configurationsList);

  if (configurationsList.translations) {
    setTranslationsList(configurationsList.translations);
  }

  if (configurationsList.fallback) {
    setFallbackLocaleCode(configurationsList.fallback);
  }

  if (configurationsList.defaultLocaleCode) {
    setCurrentLocaleCode(configurationsList.defaultLocaleCode);
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
  defaultValue: any = null
): any {
  return Obj.get(localesConfig, key, defaultValue);
}
