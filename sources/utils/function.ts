/**
 * Get hidden element count
 *
 * @param element - HTMLElement with rows or children
 * @param type - type of element table | list
 * @returns string with count or empty string
 */
export const getNumber = (
  element: {
    rows?: HTMLCollectionOf<HTMLTableRowElement>;
    children?: HTMLCollection;
  },
  type: string,
): string => {
  const elementType = type === "table" ? element.rows : element.children;

  if (!elementType) return "";

  const numbersElementHidden = Array.from(elementType).filter((el) =>
    el.classList.contains("hidden"),
  ).length;
  return numbersElementHidden !== 0 ? ` ${numbersElementHidden}` : "";
};

// https://stackoverflow.com/questions/6003271/substring-text-with-html-tags-in-javascript
/**
 * Substring text with html tags
 *
 * @param originalText - text with html tags
 * @param count - limit of characters
 * @returns truncated html string
 */
export const htmlSubstr = (originalText: string, count: number): string => {
  const div = createElement("div");
  div.insertAdjacentHTML("afterbegin", originalText);

  let remaining = count;

  walk(div, track);

  function track(el: Text): void {
    if (remaining > 0) {
      const len = el.data.length;
      remaining -= len;
      if (remaining <= 0) {
        el.data = el.substringData(0, el.data.length + remaining);
      }
    } else {
      el.data = "";
    }
  }

  function walk(el: Node, fn: (node: Text) => void): void {
    let node = el.firstChild;
    while (node) {
      if (node.nodeType === 3) {
        fn(node as Text);
      } else if (node.nodeType === 1 && node.childNodes && node.childNodes[0]) {
        walk(node, fn);
      }
      node = node.nextSibling;
    }
  }
  return div.innerHTML;
};

/**
 * Add/remove class 'hidden' to element
 *
 * @param element - HTMLElement to modify
 * @param type - true to add, false to remove
 */
export const addRemoveClass = (element: Element, type = false): void => {
  element.classList[type ? "add" : "remove"]("hidden");
};

/**
 * Set attributes to element
 *
 * @param el - HTMLElement to set attributes on
 * @param attributes - object with attribute key-value pairs
 */
export const setAttributes = (
  el: HTMLElement,
  attributes: Record<string, string | number | boolean>,
): void => {
  for (const key in attributes) {
    el.setAttribute(key, String(attributes[key]));
  }
};

/**
 * Create element
 *
 * @param type - type of element to create
 * @returns created HTMLElement
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  type: K,
): HTMLElementTagNameMap[K] => document.createElement(type);
