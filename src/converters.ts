interface Placeholders {
  [key: string]: string | number | undefined;
}

/**
 * Hyphen-separated segments directly after a placeholder name, e.g. `-min` or `-min-x`
 */
const hyphenTailPattern = /^(?:-[a-zA-Z0-9_]+)+/;

/**
 * Convert the placeholders for the given translation
 *
 * A placeholder whose name is followed by hyphen segments is replaced by the
 * longest hyphenated key present in the placeholders object (`:minutes-min` with
 * `{ "minutes-min": 5 }` gives `5`). Otherwise the name is used on its own and the
 * hyphen segments stay as literal text (`:minutes-min` with `{ minutes: 5 }` gives `5-min`).
 */
export function plainConverter(
  translation: string,
  placeholders: Placeholders = {},
  placeholderPattern: RegExp = /:([a-zA-Z0-9_]+)/g,
): string {
  const flags = placeholderPattern.global
    ? placeholderPattern.flags
    : `${placeholderPattern.flags}g`;
  const pattern = new RegExp(placeholderPattern.source, flags);

  let output = "";
  let cursor = 0;
  let replacedOnce = false;

  for (const match of translation.matchAll(pattern)) {
    const start = match.index;

    // the previous match already consumed the hyphen segments of this one
    if (start < cursor) continue;

    const [text, key] = match;
    const matchEnd = start + text.length;

    // a non-global pattern only replaces its first occurrence
    if (!placeholderPattern.global && replacedOnce) break;

    replacedOnce = true;
    output += translation.slice(cursor, start);
    cursor = matchEnd;

    // hyphen segments only extend a name that ends the match (`:name-x`, not `{{name}}-x`)
    const segments =
      key !== undefined && text.endsWith(key)
        ? translation
            .slice(matchEnd)
            .match(hyphenTailPattern)?.[0]
            .match(/-[a-zA-Z0-9_]+/g)
        : undefined;

    let resolvedKey: string | undefined;
    let consumed = 0;

    if (segments) {
      // longest hyphenated key first
      for (let count = segments.length; count > 0; count--) {
        const suffix = segments.slice(0, count).join("");
        if (placeholders[key + suffix] !== undefined) {
          resolvedKey = key + suffix;
          consumed = suffix.length;
          break;
        }
      }
    }

    if (resolvedKey === undefined) {
      if (placeholders[key] === undefined) {
        output += text; // keep the original placeholder when no value is supplied
        continue;
      }

      resolvedKey = key;
    }

    output += placeholders[resolvedKey]!.toString();
    cursor = matchEnd + consumed;
  }

  return output + translation.slice(cursor);
}
