var ShowMore = (function () {
  'use strict';

  /**
   * Default list of HTML elements to remove (with their content) for type="text"
   */ const defaultRemoveElements = [
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
      "button"
  ];
  const defaultOptions = {
      typeElement: "span",
      more: false,
      less: false,
      number: false,
      nobutton: false,
      after: 0,
      btnClass: "show-more-btn",
      btnClassAppend: null,
      removeElements: defaultRemoveElements
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
  /**
   * Remove specific HTML elements with their content
   *
   * @param html - HTML string
   * @param tags - Array of tag names to remove (e.g., ['table', 'img', 'figure'])
   * @returns HTML string without specified elements
   */ const removeElements = (html, tags)=>{
      const div = createElement("div");
      div.innerHTML = html;
      tags.forEach((tag)=>{
          const elements = div.querySelectorAll(tag);
          elements.forEach((el)=>{
              el.remove();
          });
      });
      return div.innerHTML;
  };
  /**
   * Remove table rows where ALL cells are empty
   *
   * @param div - DOM element containing HTML
   */ const cleanupTableRows = (div)=>{
      const tables = div.querySelectorAll("table");
      tables.forEach((table)=>{
          const rows = table.querySelectorAll("tr");
          rows.forEach((row)=>{
              const cells = row.querySelectorAll("td, th");
              // Check if ALL cells in this row are empty
              const allEmpty = cells.length > 0 && Array.from(cells).every((cell)=>!cell.textContent?.trim());
              if (allEmpty) {
                  row.remove();
              }
          });
      });
  };
  /**
   * Remove empty HTML tags recursively
   *
   * @param html - HTML string
   * @returns HTML string without empty tags
   */ const removeEmptyTags = (html)=>{
      let cleaned = html;
      let prev;
      // Recursively remove empty tags (including nested ones)
      // BUT keep table structure tags (td, th, tr) - they're handled separately
      do {
          prev = cleaned;
          // Remove tags that contain only whitespace or &nbsp;
          // Exclude: td, th, tr (table structure handled by cleanupTableRows)
          cleaned = cleaned.replace(/<((?!td|th|tr)\w+)(\s[^>]*)?>(\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, "");
      }while (cleaned !== prev)
      return cleaned;
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
      // Clean up table rows where ALL cells are empty
      cleanupTableRows(div);
      // Remove empty tags after truncation
      return removeEmptyTags(div.innerHTML);
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
   *
   * For type="text": removes all HTML tags except inline text formatting
   * - Keeps: <b>, <strong>, <i>, <em>, <u>, <mark>, <small>, <sub>, <sup>
   * - Removes: <table>, <ul>, <img>, <figure>, <div>, <p>, etc.
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
          // Removes all tags except inline text formatting
          // \b ensures word boundary (e.g., <i> is kept, but <img> is removed)
          match: /(<((?!\/?(?:b|strong|i|em|u|mark|small|sub|sup)\b)[^>]+)>)/gi,
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
                      // Remove unwanted elements (with their content) based on config
                      const elementsToRemove = this._object.removeElements || [];
                      let orgTexReg = removeElements(originalText, elementsToRemove);
                      // Check if removeElements is customized (different from default)
                      const isCustomRemoveElements = JSON.stringify(elementsToRemove) !== JSON.stringify(defaultRemoveElements);
                      // Apply regex rules for remaining tags
                      for (const rule of Object.values(this._regex)){
                          if (rule?.match) {
                              // Skip 'html' regex if user has custom removeElements
                              // (user controls what to remove via removeElements)
                              if (isCustomRemoveElements && rule === this._regex.html) {
                                  continue;
                              }
                              orgTexReg = orgTexReg.replace(rule.match, rule.replace);
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
                      if (!nobutton) {
                          this._addBtn(this._object);
                      }
                  }
                  return;
              }
              // list and table
              if (type === "list" || type === "table") {
                  const items = this._getNumberCount(element, type);
                  if (items.length > limitCounts) {
                      // Optimize: iterate only from limit to end
                      for(let i = limit; i < items.length; i++){
                          addRemoveClass(items[i], true);
                      }
                      if (!nobutton) {
                          this._addBtn(this._object);
                      }
                      // add event click
                      this._clickEvent(type === "list" ? element : element.nextElementSibling, this._object);
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
              // Optimize: cache getNumber result
              const numberText = number ? getNumber(element, type || "") : "";
              label = number ? label + numberText : label;
              const button = createElement("button");
              button.className = btnClassAppend == null ? btnClass : `${btnClass} ${btnClassAppend}`;
              setAttributes(button, {
                  "aria-expanded": this._checkExp,
                  "aria-label": label,
                  tabindex: 0
              });
              // Use cached numberText
              button.insertAdjacentHTML("beforeend", number ? typeAria + numberText : typeAria);
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
              if (!target.classList.contains(btnClass)) return;
              const showMoreExpanded = element.getAttribute("showmore-expanded");
              this._checkExp = showMoreExpanded === "false";
              // --------------------------------------------------
              // text
              if (type === "text") {
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
                  const isExpanding = showMoreExpanded === "false";
                  if (isExpanding) {
                      // Show all: remove hidden class from all
                      for(let i = limit; i < items.length; i++){
                          addRemoveClass(items[i], false);
                      }
                  } else {
                      // Hide: add hidden class from limit to end
                      const endIndex = type === "list" ? items.length - 1 : items.length;
                      for(let i = limit; i < endIndex; i++){
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
              // Optimize: cache getNumber result
              const numberText = number ? getNumber(element, type || "") : "";
              const ariaLabel = number ? typeAria + numberText : typeAria;
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
                  // Use cached numberText
                  target.innerHTML = number ? typeAria + numberText : typeAria;
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

})();
//# sourceMappingURL=showMore.js.map
