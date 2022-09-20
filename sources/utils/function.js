/**
 * Get hidden element
 *
 * @param {object} object
 * @param {String} type - type of element table | div
 * @returns
 */
const getNumber = ({ rows, children }, type) => {
  const elementType = type === "table" ? rows : children;

  const numbersElementHidden = [].slice
    .call(elementType)
    .filter((el) => el.classList.contains("hidden")).length;
  return numbersElementHidden !== 0 ? ` ${numbersElementHidden}` : "";
};

// https://stackoverflow.com/questions/6003271/substring-text-with-html-tags-in-javascript
/**
 * Substring text width html tags
 *
 * @param {String} originalText - text with html tags
 * @param {String} count - limit of characters
 * @returns
 */
const htmlSubstr = (originalText, count) => {
  let div = createElement("div");
  div.insertAdjacentHTML("afterbegin", originalText);

  walk(div, track);

  function track(el) {
    if (count > 0) {
      let len = el.data.length;
      count -= len;
      if (count <= 0) {
        el.data = el.substringData(0, el.data.length + count);
      }
    } else {
      el.data = "";
    }
  }

  function walk(el, fn) {
    let node = el.firstChild;
    do {
      if (node.nodeType === 3) {
        fn(node);
      } else if (node.nodeType === 1 && node.childNodes && node.childNodes[0]) {
        walk(node, fn);
      }
    } while ((node = node.nextSibling));
  }
  return div.innerHTML;
};

/**
 * Add/remove class 'hidden' to element
 *
 * @param {HTMLElement} element
 * @param {String} type - type of element add or remove
 */
const addRemoveClass = (element, type = false) => {
  return element.classList[type ? "add" : "remove"]("hidden");
};

/**
 * Set attributes to element
 *
 * @param {HTMLElement} el
 * @param {Object} object
 */
const setAttributes = (el, object) => {
  for (let key in object) {
    el.setAttribute(key, object[key]);
  }
};

/**
 * Create element
 *
 * @param {String} type - type of element
 * @returns {HTMLElement}
 */
const createElement = (type) => document.createElement(type);

export { addRemoveClass, createElement, getNumber, htmlSubstr, setAttributes };
