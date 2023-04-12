interface Placeholders {
  [key: string]: string | number | undefined;
}

/**
 * Convert the placeholders for the given translation
 */
export function plainConverter(
  translation: string,
  placeholders: Placeholders = {},
): string {
  const expression = Object.keys(placeholders)
    .map(key => `:${key}`)
    .join("|");

  const regex = new RegExp(expression, "g");

  console.log(translation, placeholders);

  return translation.replace(regex, (capture: string) => {
    const value = placeholders[capture.substring(1)];
    if (value === undefined) {
      return capture;
    }
    return value.toString();
  });
}
