import type { ShowMoreOptions } from "./utils/defaults";
import { defaultOptions } from "./utils/defaults";
import {
  addRemoveClass,
  createElement,
  getNumber,
  htmlSubstr,
  setAttributes,
} from "./utils/function";
import type { RegexConfig } from "./utils/regex";
import { defaultRegex } from "./utils/regex";

interface ShowMoreConfig {
  onMoreLess?: (action: string, object: ShowMoreInternalObject) => void;
  regex?: RegexConfig;
  config?: Partial<ShowMoreOptions>;
}

interface ShowMoreInternalObject extends ShowMoreOptions {
  index: number;
  classArray: DOMTokenList;
  element: HTMLElement;
  originalText?: string;
  truncatedText?: string;
  target?: EventTarget;
}

/**
 * ShowMore - JavaScript library that truncates text, list or table by chars, elements or rows
 */
export default class ShowMore {
  private _onMoreLess: (action: string, object: ShowMoreInternalObject) => void;
  private _regex: RegexConfig;
  private _object!: ShowMoreInternalObject;
  private _checkExp = false;

  /**
   * Constructor
   *
   * @param className - CSS selector for elements
   * @param config - Configuration object
   */
  constructor(className: string, config: ShowMoreConfig = {}) {
    const { onMoreLess = () => {}, regex = {}, config: globalConfig } = config;

    // all html elements
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(className),
    );

    // callback function
    this._onMoreLess = onMoreLess;

    // global regex
    this._regex = { ...defaultRegex, ...regex };

    elements.forEach((item, index) => {
      const configDataAttr = item.getAttribute("data-config");
      const configData = configDataAttr ? JSON.parse(configDataAttr) : {};

      const configDataAndGlobal = { ...globalConfig, ...configData };

      this._object = {
        index,
        classArray: item.classList,
        ...defaultOptions,
        ...configDataAndGlobal,
        typeElement: configDataAndGlobal.element || "span",
        element: item,
      } as ShowMoreInternalObject;

      this._initial();
    });
  }

  /**
   * Initial function
   */
  private _initial = (): void => {
    const {
      element,
      after = 0,
      ellipsis,
      nobutton,
      limit = 0,
      type,
    } = this._object;
    // set default aria-expanded to false
    setAttributes(element, { "showmore-expanded": "false" });

    const limitCounts = limit + after;
    const ellips = ellipsis === false ? "" : "...";

    // text
    if (type === "text") {
      const originalText = element.innerHTML.trim();
      const elementText = element.textContent?.trim() || "";

      if (elementText.length > limitCounts) {
        let orgTexReg = originalText;

        for (const key in this._regex) {
          const rule = this._regex[key];
          if (rule && key) {
            const { match, replace } = rule;
            if (match) orgTexReg = orgTexReg.replace(match, replace);
          }
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
          type === "list"
            ? element
            : (element.nextElementSibling as HTMLElement),
          this._object,
        );

        if (nobutton) return;
      }
    }
  };

  /**
   * Event click
   *
   * @param element - HTMLElement to attach event to
   * @param object - Configuration object
   */
  private _clickEvent = (
    element: HTMLElement | null,
    object: ShowMoreInternalObject,
  ): void => {
    if (!element) return;
    element.addEventListener("click", this._handleEvent.bind(this, object));
  };

  /**
   * Create button
   *
   * @param config - Configuration object
   * @returns HTMLButtonElement
   */
  private _createBtn = (config: ShowMoreInternalObject): HTMLButtonElement => {
    const { element, number, less, more, type, btnClass, btnClassAppend } =
      config;

    const typeAria = this._checkExp ? less || "" : more || "";
    let label = this._checkExp
      ? (less as string).trim() || "collapse"
      : (more as string).trim() || "expand";

    label = number ? label + getNumber(element, type || "") : label;

    const expanded = !!this._checkExp;

    const button = createElement("button");

    button.className =
      btnClassAppend == null ? btnClass : `${btnClass} ${btnClassAppend}`;
    setAttributes(button, {
      "aria-expanded": expanded,
      "aria-label": label,
      tabindex: 0,
    });

    button.insertAdjacentHTML(
      "beforeend",
      number ? typeAria + getNumber(element, type || "") : typeAria,
    );

    return button;
  };

  /**
   * Event handler
   *
   * @param object - Configuration object
   * @param event - Mouse event
   */
  private _handleEvent = (
    object: ShowMoreInternalObject,
    event: MouseEvent,
  ): void => {
    const { target } = event;
    if (!(target instanceof HTMLElement)) return;

    const {
      element,
      type,
      limit = 0,
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
        this._checkExp ? originalText || "" : truncatedText || "",
      );

      if (less) {
        const el = createElement(typeElement as keyof HTMLElementTagNameMap);
        el.classList.add("show-more-wrapper");
        const btn = this._createBtn(object);
        if (btn) el.insertAdjacentElement("beforeend", btn);
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

  /**
   * Get number count based on type
   */
  private _getNumberCount = (
    element: HTMLElement,
    type: string,
  ): HTMLElement[] | HTMLCollectionOf<HTMLTableRowElement> => {
    if (type === "list") {
      return Array.from(element.children) as HTMLElement[];
    }
    return (element as HTMLTableElement).rows;
  };

  /**
   * Add button
   *
   * @param object - Configuration object
   */
  private _addBtn = (object: ShowMoreInternalObject): void => {
    const { type, element, more, typeElement } = object;

    if (!more) return;

    if (type === "table") {
      element.insertAdjacentElement("afterend", this._createBtn(object));
    } else {
      const el = createElement(typeElement as keyof HTMLElementTagNameMap);
      el.classList.add("show-more-wrapper");
      el.appendChild(this._createBtn(object));
      element.appendChild(el);
    }
  };

  /**
   * Set aria-expanded
   *
   * @param object - Configuration object with target
   */
  private _setExpand = (
    object: ShowMoreInternalObject & { target: EventTarget },
  ): void => {
    const { element, type, less, more, number, target } = object;

    if (!(target instanceof HTMLElement)) return;

    const typeAria = this._checkExp ? less : more;
    const aria = this._checkExp ? "expand" : "collapse";
    const lastChild = element.lastElementChild;

    const ariaLabel = number
      ? typeAria + getNumber(element, type || "")
      : typeAria;

    setAttributes(element, { "showmore-expanded": this._checkExp });
    setAttributes(target, {
      "aria-expanded": this._checkExp,
      "aria-label": ariaLabel,
    });

    // callback function on more/less
    this._onMoreLess(aria, object);

    if (typeAria) {
      target.innerHTML = number
        ? typeAria + getNumber(element, type || "")
        : typeAria;
    } else if (type === "table") {
      target.parentNode?.removeChild(target);
    } else if (type === "list" && lastChild?.parentNode) {
      lastChild.parentNode.removeChild(lastChild);
    }
  };
}
