(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ShowMore = factory());
})(this, (function () { 'use strict';

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

  /**
   * Get hidden element count
   *
   * @param element - HTMLElement with rows or children
   * @param type - type of element table | list
   * @returns string with count or empty string
   */ const getNumber = (element, type)=>{
      const elementType = type === "table" ? element.rows : element.children;
      if (!elementType) return "";
      const numbersElementHidden = Array.from(elementType).filter((el)=>el.classList.contains("hidden")).length;
      return numbersElementHidden !== 0 ? ` ${numbersElementHidden}` : "";
  };
  // https://stackoverflow.com/questions/6003271/substring-text-with-html-tags-in-javascript
  /**
   * Substring text with html tags
   *
   * @param originalText - text with html tags
   * @param count - limit of characters
   * @returns truncated html string
   */ const htmlSubstr = (originalText, count)=>{
      const div = createElement("div");
      div.insertAdjacentHTML("afterbegin", originalText);
      let remaining = count;
      walk(div, track);
      function track(el) {
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
      function walk(el, fn) {
          let node = el.firstChild;
          while(node){
              if (node.nodeType === 3) {
                  fn(node);
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
   */ const addRemoveClass = (element, type = false)=>{
      element.classList[type ? "add" : "remove"]("hidden");
  };
  /**
   * Set attributes to element
   *
   * @param el - HTMLElement to set attributes on
   * @param attributes - object with attribute key-value pairs
   */ const setAttributes = (el, attributes)=>{
      for(const key in attributes){
          el.setAttribute(key, String(attributes[key]));
      }
  };
  /**
   * Create element
   *
   * @param type - type of element to create
   * @returns created HTMLElement
   */ const createElement = (type)=>document.createElement(type);

  /**
   * Default regexes for validation
   */ const defaultRegex = {
      newLine: {
          match: /(\r\n|\n|\r)/gm,
          replace: " "
      },
      space: {
          match: /\s\s+/gm,
          replace: " "
      },
      br: {
          match: /<br\b[^>]*\/?>/gim,
          replace: " "
      },
      html: {
          match: /(<((?!b|\/b|!strong|\/strong)[^>]+)>)/gi,
          replace: ""
      }
  };

  class ShowMore {
      /**
     * Constructor
     *
     * @param className - CSS selector for elements
     * @param config - Configuration object
     */ constructor(className, config = {}){
          this._checkExp = false;
          /**
     * Initial function
     */ this._initial = ()=>{
              const { element, after = 0, ellipsis, nobutton, limit = 0, type } = this._object;
              // set default aria-expanded to false
              setAttributes(element, {
                  "showmore-expanded": "false"
              });
              const limitCounts = limit + after;
              const ellips = ellipsis === false ? "" : "...";
              // text
              if (type === "text") {
                  const originalText = element.innerHTML.trim();
                  const elementText = element.textContent?.trim() || "";
                  if (elementText.length > limitCounts) {
                      let orgTexReg = originalText;
                      for(const key in this._regex){
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
                          truncatedText
                      });
                      if (nobutton) return;
                      this._addBtn(this._object);
                  }
              }
              // list and table
              if (type === "list" || type === "table") {
                  const items = this._getNumberCount(element, type);
                  if (items.length > limitCounts) {
                      for(let i = limit; i < items.length; i++){
                          addRemoveClass(items[i], true);
                      }
                      if (!nobutton) {
                          // add button to the list and table
                          this._addBtn(this._object);
                      }
                      // add event click
                      this._clickEvent(type === "list" ? element : element.nextElementSibling, this._object);
                      if (nobutton) return;
                  }
              }
          };
          /**
     * Event click
     *
     * @param element - HTMLElement to attach event to
     * @param object - Configuration object
     */ this._clickEvent = (element, object)=>{
              if (!element) return;
              element.addEventListener("click", this._handleEvent.bind(this, object));
          };
          /**
     * Create button
     *
     * @param config - Configuration object
     * @returns HTMLButtonElement
     */ this._createBtn = (config)=>{
              const { element, number, less, more, type, btnClass, btnClassAppend } = config;
              const typeAria = this._checkExp ? less || "" : more || "";
              let label = this._checkExp ? less.trim() || "collapse" : more.trim() || "expand";
              label = number ? label + getNumber(element, type || "") : label;
              const expanded = !!this._checkExp;
              const button = createElement("button");
              button.className = btnClassAppend == null ? btnClass : `${btnClass} ${btnClassAppend}`;
              setAttributes(button, {
                  "aria-expanded": expanded,
                  "aria-label": label,
                  tabindex: 0
              });
              button.insertAdjacentHTML("beforeend", number ? typeAria + getNumber(element, type || "") : typeAria);
              return button;
          };
          /**
     * Event handler
     *
     * @param object - Configuration object
     * @param event - Mouse event
     */ this._handleEvent = (object, event)=>{
              const { target } = event;
              if (!(target instanceof HTMLElement)) return;
              const { element, type, limit = 0, less, typeElement, originalText, truncatedText, btnClass } = object;
              // check if the button is clicked
              const checkContainsClass = target.classList.contains(btnClass);
              if (!checkContainsClass) return;
              const showMoreExpanded = element.getAttribute("showmore-expanded");
              this._checkExp = showMoreExpanded === "false";
              // --------------------------------------------------
              // text
              if (type === "text" && checkContainsClass) {
                  element.textContent = "";
                  element.insertAdjacentHTML("beforeend", this._checkExp ? originalText || "" : truncatedText || "");
                  if (less) {
                      const el = createElement(typeElement);
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
                  for(let i = 0; i < items.length; i++){
                      const typeRemove = type === "list" ? i >= limit && i < items.length - 1 : i >= limit;
                      if (showMoreExpanded === "false") {
                          addRemoveClass(items[i]);
                      } else if (typeRemove) {
                          addRemoveClass(items[i], true);
                      }
                  }
              }
              // set aria-expanded
              if (type) {
                  this._setExpand({
                      ...object,
                      target
                  });
              }
          };
          /**
     * Get number count based on type
     */ this._getNumberCount = (element, type)=>{
              if (type === "list") {
                  return Array.from(element.children);
              }
              return element.rows;
          };
          /**
     * Add button
     *
     * @param object - Configuration object
     */ this._addBtn = (object)=>{
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
     * @param object - Configuration object with target
     */ this._setExpand = (object)=>{
              const { element, type, less, more, number, target } = object;
              if (!(target instanceof HTMLElement)) return;
              const typeAria = this._checkExp ? less : more;
              const aria = this._checkExp ? "expand" : "collapse";
              const lastChild = element.lastElementChild;
              const ariaLabel = number ? typeAria + getNumber(element, type || "") : typeAria;
              setAttributes(element, {
                  "showmore-expanded": this._checkExp
              });
              setAttributes(target, {
                  "aria-expanded": this._checkExp,
                  "aria-label": ariaLabel
              });
              // callback function on more/less
              this._onMoreLess(aria, object);
              if (typeAria) {
                  target.innerHTML = number ? typeAria + getNumber(element, type || "") : typeAria;
              } else if (type === "table") {
                  target.parentNode?.removeChild(target);
              } else if (type === "list" && lastChild?.parentNode) {
                  lastChild.parentNode.removeChild(lastChild);
              }
          };
          const { onMoreLess = ()=>{}, regex = {}, config: globalConfig } = config;
          // all html elements
          const elements = Array.from(document.querySelectorAll(className));
          // callback function
          this._onMoreLess = onMoreLess;
          // global regex
          this._regex = {
              ...defaultRegex,
              ...regex
          };
          elements.forEach((item, index)=>{
              const configDataAttr = item.getAttribute("data-config");
              const configData = configDataAttr ? JSON.parse(configDataAttr) : {};
              const configDataAndGlobal = {
                  ...globalConfig,
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
