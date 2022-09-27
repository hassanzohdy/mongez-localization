import { getCurrentLocaleCode, transFrom } from "@mongez/localization";
import { jsxConverter } from "./converters";

/**
 * Translate for jsx
 */
export function transX(keyword: string, placeholders?: any) {
  return transFrom(getCurrentLocaleCode(), keyword, placeholders, jsxConverter);
}
