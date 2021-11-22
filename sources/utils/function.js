/**
 * Get hidden element
 *
 * @param {object} object
 * @param {String} type - type of element table | div
 * @returns
 */
function getNumber({ rows, children }, type) {
  const elementType = type === 'table' ? rows : children;

  const numbersElementHidden = [].slice
    .call(elementType)
    .filter((el) => el.className === 'hidden').length;
  return numbersElementHidden !== 0 ? ` ${numbersElementHidden}` : '';
}

// https://stackoverflow.com/questions/6003271/substring-text-with-html-tags-in-javascript
/**
 * Substring text width html tags
 *
 * @param {String} originalText - text with html tags
 * @param {String} count - limit of characters
 * @returns
 */
function htmlSubstr(originalText, count) {
  let div = document.createElement('div');
  div.innerHTML = originalText;

  walk(div, track);

  function track(el) {
    if (count > 0) {
      let len = el.data.length;
      count -= len;
      if (count <= 0) {
        el.data = el.substringData(0, el.data.length + count);
      }
    } else {
      el.data = '';
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
}

/**
 * Add/remove class 'hidden' to element
 *
 * @param {HTMLElement} element
 * @param {String} type - type of element add or remove
 */
function addRemoveClass(element, type = false) {
  element.classList[type ? 'add' : 'remove']('hidden');
}

export { addRemoveClass, getNumber, htmlSubstr };
