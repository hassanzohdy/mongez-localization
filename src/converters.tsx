/**
 * Convert the placeholders for the given translation
 */
export function converter(translation: string, placeholders: any) {
  const expression = `(${Object.keys(placeholders)
    .map((key) => (key.startsWith(":") ? key : ":" + key))
    .join("|")})`;

  const regex = new RegExp(expression, "g");

  return translation.replace(regex, (capture: string) => {
    return placeholders[capture.substring(1)];
  });
}
