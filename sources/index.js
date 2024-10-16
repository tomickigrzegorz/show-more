import {
  addRemoveClass,
  createElement,
  getNumber,
  htmlSubstr,
  setAttributes,
} from "./utils/function";
import { defaultRegex } from "./utils/regex";
import { defaultOptions } from "./utils/defaults";

/**
 * @class ShowMore
 */
export default class ShowMore {
  /**
   * Constructor
   *
   * @param {HTMLElement} className
   * @param {Object} object
   */
  constructor(className, { onMoreLess = () => {}, regex = {}, config } = {}) {
    // all html elements
    const elements = [].slice.call(document.querySelectorAll(className));

    // colback function
    this._onMoreLess = onMoreLess;

    // global regex
    this._regex = { ...defaultRegex, ...regex };

    elements.map((item, index) => {
      const configData = JSON.parse(item.getAttribute("data-config"));
      const configGlobal = config;

      const configDataAndGlobal = { ...configGlobal, ...configData };

      this._object = {
        index,
        classArray: item.classList,
        ...defaultOptions,
        ...configDataAndGlobal,
        typeElement: configDataAndGlobal.element || "span",
        element: item,
      };

      this._initial();
    });
  }

  /**
   * Initail function
   *
   * @param {Object} object
   */
  _initial = () => {
    const { element, after, ellipsis, nobutton, limit, type } = this._object;
    // set default aria-expande to false
    setAttributes(element, { "showmore-expanded": "false" });

    const limitCounts = limit + after;
    const ellips = ellipsis === false ? "" : "...";

    // console.log(nobutton);

    // text
    if (type === "text") {
      const originalText = element.innerHTML.trim();
      const elementText = element.textContent.trim();

      if (elementText.length > limitCounts) {
        let orgTexReg = originalText;

        for (let key in this._regex) {
          const { match, replace } = this._regex[key];
          if (key && match) orgTexReg = orgTexReg.replace(match, replace);
        }

        const truncatedText = htmlSubstr(orgTexReg, limit - 1).concat(ellips);

        element.textContent = "";
        element.insertAdjacentHTML("beforeend", truncatedText);

        this._clickEvent(element, {
          ...this._object,
          originalText,
          truncatedText,
        });

        if (nobutton) return;
        this._addBtn(this._object);
      }
    }

    // list and table
    if (type === "list" || type === "table") {
      const items = this._getNumberCount(element, type);

      if (items.length > limitCounts) {
        for (let i = limit; i < items.length; i++) {
          addRemoveClass(items[i], true);
        }

        if (!nobutton) {
          // add button to the list and table
          this._addBtn(this._object);
        }

        // add event click
        this._clickEvent(
          type === "list" ? element : element.nextElementSibling,
          this._object,
        );

        if (nobutton) return;
      }
    }
  };

  /**
   * Event click
   *
   * @param {HTMLElement} element
   * @param {Object} object
   */
  _clickEvent = (element, object) =>
    element.addEventListener("click", this._handleEvent.bind(this, object));

  /**
   * Create button
   *
   * @param {Object} object
   * @returns HTMLElement
   */
  _createBtn = ({
    element,
    number,
    less,
    more,
    type,
    btnClass,
    btnClassAppend,
  }) => {
    const typeAria = this._checkExp ? less || "" : more || "";
    let label = this._checkExp
      ? less.trim() || "collapse"
      : more.trim() || "expand";

    label = number ? label + getNumber(element, type) : label;

    const expanded = this._checkExp ? true : false;

    const button = createElement("button");

    button.className =
      btnClassAppend == null ? btnClass : btnClass + " " + btnClassAppend;
    setAttributes(button, {
      "aria-expanded": expanded,
      "aria-label": label,
      tabindex: 0,
    });

    button.insertAdjacentHTML(
      "beforeend",
      number ? typeAria + getNumber(element, type) : typeAria,
    );

    return button;
  };

  /**
   * Event handler
   *
   * @param {Object} object
   * @param {Event} event
   */
  _handleEvent = (object, { target }) => {
    const {
      element,
      type,
      limit,
      less,
      typeElement,
      originalText,
      truncatedText,
      btnClass,
    } = object;

    // check if the button is clicked
    const checkContainsClass = target.classList.contains(btnClass);

    if (!checkContainsClass) return;

    const showMoreExpanded = element.getAttribute("showmore-expanded");
    this._checkExp = showMoreExpanded === "false";

    // --------------------------------------------------
    // text
    if (type === "text" && checkContainsClass) {
      element.textContent = "";

      element.insertAdjacentHTML(
        "beforeend",
        this._checkExp ? originalText : truncatedText,
      );

      if (less) {
        const el = createElement(typeElement);
        el.classList.add("show-more-wrapper");
        el.insertAdjacentElement("beforeend", this._createBtn(object));
        element.appendChild(el);
      }
    }

    // --------------------------------------------------
    // list and table
    if (type === "list" || type === "table") {
      const items = this._getNumberCount(element, type);

      for (let i = 0; i < items.length; i++) {
        const typeRemove =
          type === "list" ? i >= limit && i < items.length - 1 : i >= limit;

        if (showMoreExpanded === "false") {
          addRemoveClass(items[i]);
        } else if (typeRemove) {
          addRemoveClass(items[i], true);
        }
      }
    }

    // set aria-expanded
    if (type) {
      this._setExpand({ ...object, target });
    }
  };

  _getNumberCount = (element, type) => {
    return type === "list" ? [].slice.call(element.children) : element.rows;
  };

  /**
   * Add button
   *
   * @param {Object} object
   */
  _addBtn = (object) => {
    const { type, element, more, typeElement } = object;

    if (!more) return;

    if (type === "table") {
      element.insertAdjacentElement("afterend", this._createBtn(object));
    } else {
      const el = createElement(typeElement);
      el.classList.add("show-more-wrapper");
      el.appendChild(this._createBtn(object));
      element.appendChild(el);
    }
  };

  /**
   * Set aria-expanded
   *
   * @param {Object} object
   */
  _setExpand = (object) => {
    const { element, type, less, more, number, target } = object;

    const typeAria = this._checkExp ? less : more;
    const aria = this._checkExp ? "expand" : "collapse";
    const lastChild = element.lastElementChild;

    const ariaLabel = number ? typeAria + getNumber(element, type) : typeAria;

    setAttributes(element, { "showmore-expanded": this._checkExp });
    setAttributes(target, {
      "aria-expanded": this._checkExp,
      "aria-label": ariaLabel,
    });

    // callback function on more/less
    this._onMoreLess(aria, object);

    if (typeAria) {
      target.innerHTML = number
        ? typeAria + getNumber(element, type)
        : typeAria;
    } else if (type === "table") {
      target.parentNode.removeChild(target);
    } else if (type === "list") {
      lastChild.parentNode.removeChild(lastChild);
    }
  };
}
