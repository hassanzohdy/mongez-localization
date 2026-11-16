// :placeholder pattern. Names stop at a hyphen, so `:minutes-min` reads `minutes`
// followed by literal `-min`. A hyphenated key is still matched when the placeholders
// object has that exact key (see `plainConverter`).
const colonPlaceholderPattern: RegExp = /:([a-zA-Z0-9_]+)/g;

// {{placeholder}} pattern
const doubleCurlyPlaceholderPattern: RegExp = /{{([a-zA-Z0-9_-]+)}}/g;

export const placeholderPatterns = {
  colon: colonPlaceholderPattern,
  doubleCurly: doubleCurlyPlaceholderPattern,
};

let placeholderPattern = colonPlaceholderPattern;

export function setPlaceholderPattern(pattern: RegExp) {
  placeholderPattern = pattern;
}

export function getPlaceholderPattern() {
  return placeholderPattern;
}
