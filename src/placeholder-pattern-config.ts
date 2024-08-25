// :placeholder pattern
const colonPlaceholderPattern: RegExp = /:([a-zA-Z0-9_-]+)/g;

// {{placeholder}} pattern
const doubleCurlyPlaceholderPattern: RegExp = /{{([a-zA-Z0-9_-]+)}}/g;

const defaultPlaceholderPattern: RegExp = colonPlaceholderPattern;

export const placeholderPatterns = {
  colon: colonPlaceholderPattern,
  doubleCurly: doubleCurlyPlaceholderPattern,
};

let placeholderPattern = /:([a-zA-Z0-9_-]+)/g;

export function setPlaceholderPattern(pattern: RegExp) {
  placeholderPattern = pattern;
}

export function getPlaceholderPattern() {
  return placeholderPattern;
}
