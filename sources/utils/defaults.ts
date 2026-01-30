export interface ShowMoreOptions {
  typeElement: string;
  more: string | false;
  less: string | false;
  number: boolean;
  nobutton: boolean;
  after: number;
  btnClass: string;
  btnClassAppend: string | null;
  limit?: number;
  type?: "text" | "list" | "table";
  element?: HTMLElement;
  ellipsis?: boolean | string;
  removeElements?: string[];
}

/**
 * Default list of HTML elements to remove (with their content) for type="text"
 */
export const defaultRemoveElements = [
  // Tables
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  // Lists
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  // Multimedia
  "figure",
  "figcaption",
  "img",
  "picture",
  "source",
  "video",
  "audio",
  // Embedded content
  "iframe",
  "object",
  "embed",
  "canvas",
  "svg",
  // Scripts & styles
  "script",
  "style",
  // Forms
  "form",
  "input",
  "select",
  "textarea",
  "button",
];

export const defaultOptions: Partial<ShowMoreOptions> = {
  typeElement: "span",
  more: false,
  less: false,
  number: false,
  nobutton: false,
  after: 0,
  btnClass: "show-more-btn",
  btnClassAppend: null,
  removeElements: defaultRemoveElements,
};
