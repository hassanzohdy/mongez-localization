interface Placeholders {
  [key: string]: string | number | undefined;
}

/**
 * Convert the placeholders for the given translation
 */
export function plainConverter(
  translation: string,
  placeholders: Placeholders = {},
  placeholderPattern: RegExp = /:([a-zA-Z0-9_-]+)/g,
): string {
  return translation.replace(
    placeholderPattern,
    (match: string, key: string) => {
      const value = placeholders[key];
      if (value === undefined) {
        return match; // Return the original placeholder if no match is found
      }

      return value.toString();
    },
  );
}
