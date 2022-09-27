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

/**
 * JSX converter
 */
export function jsxConverter(translation: string, placeholders: any) {
  const expression = `(${Object.keys(placeholders)
    .map((key) => (key.startsWith(":") ? key : ":" + key))
    .join("|")})`;

  const regex = new RegExp(expression, "g");

  return translation
    .split(regex)
    .filter((item) => item !== undefined)
    .map((part) => {
      if (part.startsWith(":")) {
        part = part.substring(1);
      }

      return placeholders[part] || part;
    });
}
