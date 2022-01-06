import { LocaleCodeChangeCallback, LocalizationEventName } from "./types";
import events, { EventSubscription } from "@mongez/events";

const BASE_LOCALIZATION_CHANGE_EVENT = "localization.change";

export const localizationEvents = {
  triggerChange(
    eventName: LocalizationEventName,
    newLocaleCode: string,
    oldLocaleCode: string
  ): void {
    events.trigger(
      BASE_LOCALIZATION_CHANGE_EVENT + "." + eventName,
      newLocaleCode,
      oldLocaleCode
    );
  },
  onChange(
    eventName: LocalizationEventName,
    callback: LocaleCodeChangeCallback
  ): EventSubscription {
    return events.subscribe(
      BASE_LOCALIZATION_CHANGE_EVENT + "." + eventName,
      callback
    );
  },
};
