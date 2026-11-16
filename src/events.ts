import events, { EventSubscription } from "@mongez/events";
import {
  LocaleCodeChangeCallback,
  LocalizationEventName,
  TranslationsChangeCallback,
  TranslationsEventName,
} from "./types";

const BASE_LOCALIZATION_CHANGE_EVENT = "localization.change";

/**
 * Subscribe to a localization change. `"translations"` fires after `extend`,
 * `groupedTranslations` and `setTranslationsList` with the affected locale
 * codes; `"localeCode"` and `"fallback"` fire with the new and old codes.
 */
function onChange(
  eventName: TranslationsEventName,
  callback: TranslationsChangeCallback,
): EventSubscription;
function onChange(
  eventName: LocalizationEventName,
  callback: LocaleCodeChangeCallback,
): EventSubscription;
function onChange(
  eventName: LocalizationEventName | TranslationsEventName,
  callback: LocaleCodeChangeCallback | TranslationsChangeCallback,
): EventSubscription {
  return events.subscribe(
    BASE_LOCALIZATION_CHANGE_EVENT + "." + eventName,
    callback,
  );
}

export const localizationEvents = {
  /**
   * Trigger the `translations` event with the affected locale codes
   */
  triggerTranslationsChange(localeCodes: string[]): void {
    events.trigger(
      BASE_LOCALIZATION_CHANGE_EVENT + ".translations",
      localeCodes,
    );
  },
  triggerChange(
    eventName: LocalizationEventName,
    newLocaleCode: string,
    oldLocaleCode: string,
  ): void {
    events.trigger(
      BASE_LOCALIZATION_CHANGE_EVENT + "." + eventName,
      newLocaleCode,
      oldLocaleCode,
    );
  },
  onChange,
};
