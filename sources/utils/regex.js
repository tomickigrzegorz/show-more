/**
 * Default regexes for validation
 */
export const defaultRegex = {
  newLine: {
    match: /(\r\n|\n|\r)/gm,
    replace: "",
  },
  space: {
    match: /\s\s+/gm,
    replace: " ",
  },
  br: {
    match: /<br\s*\/?>/gim,
    replace: "",
  },
  html: {
    match: /(<((?!b|\/b|!strong|\/strong)[^>]+)>)/gi,
    replace: "",
  },
};
