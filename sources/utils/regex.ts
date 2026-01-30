export interface RegexRule {
  match: RegExp;
  replace: string;
}

export interface RegexConfig {
  newLine?: RegexRule;
  space?: RegexRule;
  br?: RegexRule;
  html?: RegexRule;
  [key: string]: RegexRule | undefined;
}

/**
 * Default regexes for validation
 */
export const defaultRegex: RegexConfig = {
  newLine: {
    match: /(\r\n|\n|\r)/gm,
    replace: " ",
  },
  space: {
    match: /\s\s+/gm,
    replace: " ",
  },
  br: {
    match: /<br\b[^>]*\/?>/gim,
    replace: " ",
  },
  html: {
    match: /(<((?!b|\/b|!strong|\/strong)[^>]+)>)/gi,
    replace: "",
  },
};
