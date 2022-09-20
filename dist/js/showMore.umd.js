(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ShowMore = factory());
})(this, (function () { 'use strict';

  const getNumber = (_ref, type) => {
    let {
      rows,
      children
    } = _ref;
    const elementType = type === "table" ? rows : children;
    const numbersElementHidden = [].slice.call(elementType).filter(el => el.classList.contains("hidden")).length;
    return numbersElementHidden !== 0 ? " " + numbersElementHidden : "";
  };
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
      } while (node = node.nextSibling);
    }
    return div.innerHTML;
  };
  const addRemoveClass = function (element, type) {
    if (type === void 0) {
      type = false;
    }
    return element.classList[type ? "add" : "remove"]("hidden");
  };
  const setAttributes = (el, object) => {
    for (let key in object) {
      el.setAttribute(key, object[key]);
    }
  };
  const createElement = type => document.createElement(type);

  const defaultRegex = {
    newLine: {
      match: /(\r\n|\n|\r)/gm,
      replace: ""
    },
    space: {
      match: /\s\s+/gm,
      replace: " "
    },
    br: {
      match: /<br\s*\/?>/gim,
      replace: ""
    },
    html: {
      match: /(<((?!b|\/b|!strong|\/strong)[^>]+)>)/gi,
      replace: ""
    }
  };

  const defaultOptions = {
    typeElement: "span",
    more: false,
    less: false,
    number: false,
    nobutton: false,
    after: 0,
    btnClass: "show-more-btn",
    btnClassAppend: null
  };

  class ShowMore {
    constructor(className, _temp) {
      let {
        onMoreLess = () => {},
        regex = {},
        config
      } = _temp === void 0 ? {} : _temp;
      this._initial = () => {
        const {
          element,
          after,
          ellipsis,
          nobutton,
          limit,
          type
        } = this._object;
        setAttributes(element, {
          "aria-expanded": "false"
        });
        const limitCounts = limit + after;
        const ellips = ellipsis === false ? "" : "...";
        if (type === "text") {
          const originalText = element.innerHTML.trim();
          const elementText = element.textContent.trim();
          if (elementText.length > limitCounts) {
            let orgTexReg = originalText;
            for (let key in this._regex) {
              const {
                match,
                replace
              } = this._regex[key];
              if (key && match) orgTexReg = orgTexReg.replace(match, replace);
            }
            const truncatedText = htmlSubstr(orgTexReg, limit - 1).concat(ellips);
            element.textContent = "";
            element.insertAdjacentHTML("beforeend", truncatedText);
            this._clickEvent(element, { ...this._object,
              originalText,
              truncatedText
            });
            if (nobutton) return;
            this._addBtn(this._object);
          }
        }
        if (type === "list" || type === "table") {
          const items = this._getNumberCount(element, type);
          if (items.length > limitCounts) {
            for (let i = limit; i < items.length; i++) {
              addRemoveClass(items[i], true);
            }
            if (!nobutton) {
              this._addBtn(this._object);
            }
            this._clickEvent(type === "list" ? element : element.nextElementSibling, this._object);
            if (nobutton) return;
          }
        }
      };
      this._clickEvent = (element, object) => element.addEventListener("click", this._handleEvent.bind(this, object));
      this._createBtn = _ref => {
        let {
          element,
          number,
          less,
          more,
          type,
          btnClass,
          btnClassAppend
        } = _ref;
        const typeAria = this._checkExp ? less || "" : more || "";
        const label = this._checkExp ? "collapse" : "expand";
        const expanded = this._checkExp ? true : false;
        const button = createElement("button");
        button.className = btnClassAppend == null ? btnClass : btnClass + " " + btnClassAppend;
        setAttributes(button, {
          "aria-expanded": expanded,
          "aria-label": label,
          tabindex: 0
        });
        button.insertAdjacentHTML("beforeend", number ? typeAria + getNumber(element, type) : typeAria);
        return button;
      };
      this._handleEvent = (object, _ref2) => {
        let {
          target
        } = _ref2;
        const {
          element,
          type,
          limit,
          less,
          typeElement,
          originalText,
          truncatedText,
          btnClass
        } = object;
        const checkContainsClass = target.classList.contains(btnClass);
        if (!checkContainsClass) return;
        const ariaExpanded = element.getAttribute("aria-expanded");
        this._checkExp = ariaExpanded === "false";
        if (type === "text" && checkContainsClass) {
          element.textContent = "";
          element.insertAdjacentHTML("beforeend", this._checkExp ? originalText : truncatedText);
          if (less) {
            const el = createElement(typeElement);
            el.classList.add("show-more-wrapper");
            el.insertAdjacentElement("beforeend", this._createBtn(object));
            element.appendChild(el);
          }
        }
        if (type === "list" || type === "table") {
          const items = this._getNumberCount(element, type);
          for (let i = 0; i < items.length; i++) {
            const typeRemove = type === "list" ? i >= limit && i < items.length - 1 : i >= limit;
            if (ariaExpanded === "false") {
              addRemoveClass(items[i]);
            } else if (typeRemove) {
              addRemoveClass(items[i], true);
            }
          }
        }
        if (type) {
          this._setExpand({ ...object,
            target
          });
        }
      };
      this._getNumberCount = (element, type) => {
        return type === "list" ? [].slice.call(element.children) : element.rows;
      };
      this._addBtn = object => {
        const {
          type,
          element,
          more,
          typeElement
        } = object;
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
      this._setExpand = object => {
        const {
          element,
          type,
          less,
          more,
          number,
          target
        } = object;
        const typeAria = this._checkExp ? less : more;
        const aria = this._checkExp ? "expand" : "collapse";
        const ariaText = type === "table" ? type : "the " + type;
        const lastChild = element.lastElementChild;
        setAttributes(element, {
          "aria-expanded": this._checkExp
        });
        setAttributes(target, {
          "aria-expanded": this._checkExp,
          "aria-label": aria + " " + ariaText
        });
        this._onMoreLess(aria, object);
        if (typeAria) {
          target.innerHTML = number ? typeAria + getNumber(element, type) : typeAria;
        } else if (type === "table") {
          target.parentNode.removeChild(target);
        } else if (type === "list") {
          lastChild.parentNode.removeChild(lastChild);
        }
      };
      const elements = [].slice.call(document.querySelectorAll(className));
      this._onMoreLess = onMoreLess;
      this._regex = { ...defaultRegex,
        ...regex
      };
      elements.map((item, index) => {
        const configData = JSON.parse(item.getAttribute("data-config"));
        const configGlobal = config;
        const configDataAndGlobal = { ...configGlobal,
          ...configData
        };
        this._object = {
          index,
          classArray: item.classList,
          ...defaultOptions,
          ...configDataAndGlobal,
          typeElement: configDataAndGlobal.element || "span",
          element: item
        };
        this._initial();
      });
    }
  }

  return ShowMore;

}));
//# sourceMappingURL=showMore.umd.js.map
