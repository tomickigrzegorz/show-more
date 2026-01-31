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
 *
 * For type="text": removes all HTML tags except inline text formatting
 * - Keeps: <b>, <strong>, <i>, <em>, <u>, <mark>, <small>, <sub>, <sup>
 * - Removes: <table>, <ul>, <img>, <figure>, <div>, <p>, etc.
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
    // Removes all tags except inline text formatting
    // \b ensures word boundary (e.g., <i> is kept, but <img> is removed)
    match: /(<((?!\/?(?:b|strong|i|em|u|mark|small|sub|sup)\b)[^>]+)>)/gi,
    replace: "",
  },
};
