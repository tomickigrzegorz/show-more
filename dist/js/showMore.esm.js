function getNumber(_ref, type) {
  let {
    rows,
    children
  } = _ref;
  const elementType = type === 'table' ? rows : children;
  const numbersElementHidden = [].slice.call(elementType).filter(el => el.className === 'hidden').length;
  return numbersElementHidden !== 0 ? " " + numbersElementHidden : '';
}
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
    } while (node = node.nextSibling);
  }
  return div.innerHTML;
}
function addRemoveClass(element, type) {
  if (type === void 0) {
    type = false;
  }
  element.classList[type ? 'add' : 'remove']('hidden');
}

const defaultRegex = {
  newLine: {
    match: /(\r\n|\n|\r)/gm,
    replace: ''
  },
  space: {
    match: /\s\s+/gm,
    replace: ' '
  },
  br: {
    match: /<br\s*\/?>/gim,
    replace: ''
  },
  html: {
    match: /(<((?!b|\/b|!strong|\/strong)[^>]+)>)/gi,
    replace: ''
  }
};

class ShowMore {
  constructor(className, _temp) {
    let {
      onMoreLess = () => {},
      regex = {},
      config
    } = _temp === void 0 ? {} : _temp;
    const elements = document.querySelectorAll(className);
    this.onMoreLess = onMoreLess;
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
        btnClassAppend
      } = JSON.parse(elements[i].getAttribute('data-config')) || config;
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
        btnClassAppend: btnClassAppend || null
      };
      this.initial(this.object);
    }
  }
  initial(_ref) {
    let {
      element,
      after,
      ellipsis,
      limit,
      type
    } = _ref;
    element.setAttribute('aria-expanded', 'false');
    const limitCounts = limit + after;
    const ellips = ellipsis === false ? '' : '...';
    if (type === 'text') {
      let truncatedText = '';
      const originalText = element.innerHTML.trim();
      let elementText = element.textContent.trim();
      let orgTexReg = originalText;
      for (let key in this.regex) {
        const {
          match,
          replace
        } = this.regex[key];
        if (key && match) orgTexReg = orgTexReg.replace(match, replace);
      }
      if (elementText.length > limitCounts) {
        truncatedText = htmlSubstr(orgTexReg, limit).concat(ellips);
        element.innerHTML = truncatedText;
        this.addBtn(this.object);
        this.clickEvent(element, { ...this.object,
          originalText,
          truncatedText
        });
      }
    }
    if (type === 'list' || type === 'table') {
      const items = type === 'list' ? [].slice.call(element.children) : element.rows;
      if (items.length > limitCounts) {
        for (let i = limit; i < items.length; i++) {
          addRemoveClass(items[i], true);
        }
        this.addBtn(this.object);
        this.clickEvent(type === 'list' ? element : element.nextElementSibling, this.object);
      }
    }
  }
  clickEvent(element, object) {
    element.addEventListener('click', this.handleEvent.bind(this, object));
  }
  createBtn(_ref2) {
    let {
      element,
      number,
      less,
      more,
      type,
      btnClass,
      btnClassAppend
    } = _ref2;
    const typeAria = this.checkExp ? less || '' : more || '';
    const label = this.checkExp ? 'collapse' : 'expand';
    const expanded = this.checkExp ? true : false;
    const btn = document.createElement('button');
    btn.className = btnClassAppend == null ? btnClass : btnClass + ' ' + btnClassAppend;
    btn.setAttribute('aria-expanded', expanded);
    btn.setAttribute('aria-label', label);
    btn.setAttribute('tabindex', 0);
    btn.innerHTML = number ? typeAria + getNumber(element, type) : typeAria;
    return btn;
  }
  handleEvent(object, _ref3) {
    let {
      currentTarget,
      target
    } = _ref3;
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
    const ariaExpanded = element.getAttribute('aria-expanded');
    this.checkExp = ariaExpanded === 'false';
    if (type === 'text' && checkContainsClass) {
      element.innerHTML = '';
      element.innerHTML = this.checkExp ? originalText : truncatedText;
      if (less) {
        const el = document.createElement(typeElement);
        el.insertAdjacentElement('beforeend', this.createBtn(object));
        element.appendChild(el);
      }
    }
    if (type === 'list' || type === 'table') {
      const items = type === 'list' ? [].slice.call(currentTarget.children) : element.rows;
      for (let i = 0; i < items.length; i++) {
        const typeRemove = type === 'list' ? i >= limit && i < items.length - 1 : i >= limit;
        if (ariaExpanded === 'false') {
          addRemoveClass(items[i]);
        } else if (typeRemove) {
          addRemoveClass(items[i], true);
        }
      }
    }
    if (type === 'table' || type === 'list' || type === 'text') {
      this.setExpand({ ...object,
        target
      });
    }
  }
  addBtn(object) {
    const {
      type,
      element,
      more,
      typeElement
    } = object;
    if (!more) return;
    if (type === 'table') {
      element.insertAdjacentElement('afterend', this.createBtn(object));
    } else {
      const el = document.createElement(typeElement);
      el.appendChild(this.createBtn(object));
      element.appendChild(el);
    }
  }
  setExpand(object) {
    const {
      element,
      type,
      less,
      more,
      number,
      target
    } = object;
    const check = this.checkExp;
    const typeAria = check ? less : more;
    const aria = check ? 'expand' : 'collapse';
    const ariaText = type === 'table' ? type : "the " + type;
    const lastChild = element.lastElementChild;
    element.setAttribute('aria-expanded', check);
    target.setAttribute('aria-expanded', check);
    target.setAttribute('aria-label', aria + " " + ariaText);
    this.onMoreLess(aria, object);
    if (typeAria) {
      target.innerHTML = number ? typeAria + getNumber(element, type) : typeAria;
    } else if (type === 'table') {
      target.parentNode.removeChild(target);
    } else if (type === 'list') {
      lastChild.parentNode.removeChild(lastChild);
    }
  }
}

export { ShowMore as default };
//# sourceMappingURL=showMore.esm.js.map
