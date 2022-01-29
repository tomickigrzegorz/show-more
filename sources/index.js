import { addRemoveClass, getNumber, htmlSubstr } from './utils/function';
import defaultRegex from './utils/regex';

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
    const elements = document.querySelectorAll(className);

    // colback function
    this.onMoreLess = onMoreLess;

    // global regex
    this.regex = Object.assign(defaultRegex, regex);

    for (let i = 0; i < elements.length; i++) {
      const {
        type,
        limit,
        element,
        after,
        more,
        less,
        number,
        ellipsis,
        btnClass,
        btnClassAppend,
      } = JSON.parse(elements[i].getAttribute('data-config')) || config;

      // create global object
      this.object = {
        index: i,
        element: elements[i],
        type,
        limit,
        classArray: elements[i].classList,
        ellipsis,
        typeElement: element || 'span',
        more: more || false,
        less: less || false,
        number: number || false,
        after: after || 0,
        btnClass: btnClass || 'show-more-btn',
        btnClassAppend: btnClassAppend || null,
      };

      this.initial(this.object);
    }
  }

  /**
   * Initail function
   *
   * @param {Object} object
   */
  initial({ element, after, ellipsis, limit, type }) {
    // set default aria-expande to false
    element.setAttribute('aria-expanded', 'false');

    const limitCounts = limit + after;
    const ellips = ellipsis === false ? '' : '...';

    // text
    if (type === 'text') {
      let truncatedText = '';
      const originalText = element.innerHTML.trim();
      let elementText = element.textContent.trim();

      let orgTexReg = originalText;
      for (let key in this.regex) {
        const { match, replace } = this.regex[key];
        if (key && match) orgTexReg = orgTexReg.replace(match, replace);
      }

      if (elementText.length > limitCounts) {
        truncatedText = htmlSubstr(orgTexReg, limit).concat(ellips);

        element.innerHTML = truncatedText;

        this.addBtn(this.object);

        this.clickEvent(element, {
          ...this.object,
          originalText,
          truncatedText,
        });
      }
    }

    // list and table
    if (type === 'list' || type === 'table') {
      const items =
        type === 'list' ? [].slice.call(element.children) : element.rows;

      if (items.length > limitCounts) {
        for (let i = limit; i < items.length; i++) {
          addRemoveClass(items[i], true);
        }

        // add button to the list and table
        this.addBtn(this.object);

        // add event click
        this.clickEvent(
          type === 'list' ? element : element.nextElementSibling,
          this.object
        );
      }
    }
  }

  /**
   * Event click
   *
   * @param {HTMLElement} element
   * @param {Object} object
   */
  clickEvent(element, object) {
    element.addEventListener('click', this.handleEvent.bind(this, object));
  }

  /**
   * Create button
   *
   * @param {Object} object
   * @returns HTMLElement
   */
  createBtn({ element, number, less, more, type, btnClass, btnClassAppend }) {
    const typeAria = this.checkExp ? less || '' : more || '';
    const label = this.checkExp ? 'collapse' : 'expand';
    const expanded = this.checkExp ? true : false;

    const btn = document.createElement('button');
    btn.className =
      btnClassAppend == null ? btnClass : btnClass + ' ' + btnClassAppend;
    btn.setAttribute('aria-expanded', expanded);
    btn.setAttribute('aria-label', label);
    btn.setAttribute('tabindex', 0);
    btn.innerHTML = number ? typeAria + getNumber(element, type) : typeAria;
    return btn;
  }

  /**
   * Event handler
   *
   * @param {Object} object
   * @param {Event} event
   */
  handleEvent(object, { currentTarget, target }) {
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

    const ariaExpanded = element.getAttribute('aria-expanded');
    this.checkExp = ariaExpanded === 'false';

    // --------------------------------------------------
    // text
    if (type === 'text' && checkContainsClass) {
      element.innerHTML = '';
      element.innerHTML = this.checkExp ? originalText : truncatedText;

      if (less) {
        const el = document.createElement(typeElement);
        el.insertAdjacentElement('beforeend', this.createBtn(object));
        element.appendChild(el);
      }
    }

    // --------------------------------------------------
    // list and table
    if (type === 'list' || type === 'table') {
      const items =
        type === 'list' ? [].slice.call(currentTarget.children) : element.rows;

      for (let i = 0; i < items.length; i++) {
        const typeRemove =
          type === 'list' ? i >= limit && i < items.length - 1 : i >= limit;

        if (ariaExpanded === 'false') {
          addRemoveClass(items[i]);
        } else if (typeRemove) {
          addRemoveClass(items[i], true);
        }
      }
    }

    // set aria-expanded
    if (type === 'table' || type === 'list' || type === 'text') {
      this.setExpand({ ...object, target });
    }
  }

  /**
   * Add button
   *
   * @param {Object} object
   */
  addBtn(object) {
    const { type, element, more, typeElement } = object;

    if (!more) return;

    if (type === 'table') {
      element.insertAdjacentElement('afterend', this.createBtn(object));
    } else {
      const el = document.createElement(typeElement);
      el.appendChild(this.createBtn(object));
      element.appendChild(el);
    }
  }

  /**
   * Set aria-expanded
   *
   * @param {Object} object
   */
  setExpand(object) {
    const { element, type, less, more, number, target } = object;

    const check = this.checkExp;

    const typeAria = check ? less : more;
    const aria = check ? 'expand' : 'collapse';
    const ariaText = type === 'table' ? type : `the ${type}`;
    const lastChild = element.lastElementChild;

    element.setAttribute('aria-expanded', check);
    target.setAttribute('aria-expanded', check);
    target.setAttribute('aria-label', `${aria} ${ariaText}`);

    // callback function on more/less
    this.onMoreLess(aria, object);

    if (typeAria) {
      target.innerHTML = number
        ? typeAria + getNumber(element, type)
        : typeAria;
    } else if (type === 'table') {
      target.parentNode.removeChild(target);
    } else if (type === 'list') {
      lastChild.parentNode.removeChild(lastChild);
    }
  }
}
