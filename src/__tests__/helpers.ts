import events from "@mongez/events";
import {
  plainConverter,
  setConverter,
  setCurrentLocaleCode,
  setFallbackLocaleCode,
  setTranslationsList,
} from "..";
import { setPlaceholderPattern } from "../placeholder-pattern-config";

/**
 * Reset every piece of module-level state the package touches.
 *
 * The translator, the placeholder pattern, the events bus, and the merged
 * configuration object all live as module-level singletons. Without this
 * helper, a test that sets a fallback locale leaks into the next test's
 * "missing key" assertions; a test that swaps the converter taints every
 * subsequent `trans()` call; and event listeners from previous tests keep
 * firing across describe boundaries.
 */
export function resetLocalization(): void {
  setTranslationsList({});
  setCurrentLocaleCode("en");
  setFallbackLocaleCode("en");
  setConverter(plainConverter);
  setPlaceholderPattern(/:([a-zA-Z0-9_-]+)/g);
  // Strip every localization.* listener; tests don't share subscriptions.
  events.unsubscribeNamespace("localization.change");
}
