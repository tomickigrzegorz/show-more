class ShowMore {
  constructor(className, { onMoreLess = () => { } } = {}) {
    this.elements = document.querySelectorAll(className);
    this.onMoreLess = onMoreLess;

    this.regex = {
      newLine: /(\r\n|\n|\r)/gm,
      space: /\s\s+/gm,
      br: /<br\s*\/?>/gim,
      html: /(<((?!b|\/b|!strong|\/strong)[^>]+)>)/ig,
      // img: /<img([\w\W]+?)[/]?>/g,
    };
    for (let i = 0; i < this.elements.length; i++) {
      const {
        type,
        limit,
        element,
        after,
        more,
        less,
        number,
        ellipsis,
      } = JSON.parse(this.elements[i].getAttribute('data-config'));

      this.object = {
        index: i,
        element: this.elements[i],
        type,
        limit,
        classArray: this.elements[i].classList,
        ellipsis,
        typeElement: element || 'span',
        more: more || false,
        less: less || false,
        number: number || false,
        after: after || 0,
      };
      this.initial(this.object);
    }
  }

  // https://stackoverflow.com/questions/6003271/substring-text-with-html-tags-in-javascript
  htmlSubstr = (str, count) => {
    var div = document.createElement('div');
    div.innerHTML = str;

    walk(div, track);

    function track(el) {
      if (count > 0) {
        var len = el.data.length;
        count -= len;
        if (count <= 0) {
          el.data = el.substringData(0, el.data.length + count);
        }
      } else {
        el.data = '';
      }
    }

    function walk(el, fn) {
      var node = el.firstChild;
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

  initial = ({ element, after, ellipsis, limit, type }) => {
    // set default aria-expande to false
    element.setAttribute('aria-expanded', 'false');
    const limitCounts = limit + after;
    const ellips = ellipsis === false ? '' : '...';

    if (type === 'text') {
      let truncatedText = '';
      const originalText = element.innerHTML.trim();
      let elementText = element.textContent.trim();

      const orgTexReg = originalText
        .replace(this.regex.br, '')
        .replace(this.regex.newLine, '')
        .replace(this.regex.space, ' ')
        .replace(this.regex.html, '')
      // .replace(this.regex.img, '')

      if (elementText.length > limitCounts) {
        truncatedText = this.htmlSubstr(orgTexReg, limit).concat(ellips);

        element.innerHTML = truncatedText;

        this.addBtn(this.object);

        this.clickEvent(element, {
          ...this.object,
          originalText,
          truncatedText,
        });
      }
    }

    if (type === 'list' || type === 'table') {
      const items =
        type === 'list' ? [].slice.call(element.children) : element.rows;

      if (items.length > limitCounts) {
        for (let i = limit; i < items.length; i++) {
          this.addRemClass(items[i], true);
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
  };

  clickEvent = (element, object) => {
    element.addEventListener('click', this.handleEvent.bind(this, object));
  };

  createBtn = ({ element, number, less, more, type }) => {
    const typeAria = this.checkExp ? less || '' : more || '';
    const label = this.checkExp ? 'collapse' : 'expand';
    const expanded = this.checkExp ? true : false;

    const btn = document.createElement('button');
    btn.className = 'show-more-btn';
    btn.setAttribute('aria-expanded', expanded);
    btn.setAttribute('aria-label', label);
    btn.setAttribute('tabindex', 0);
    btn.innerHTML = number
      ? typeAria + this.getNumber(element, type)
      : typeAria;
    return btn;
  };

  addRemClass = (element, type) => {
    element.classList[type ? 'add' : 'remove']('hidden');
  };

  handleEvent = (object, event) => {
    const {
      element,
      type,
      limit,
      less,
      typeElement,
      originalText,
      truncatedText,
    } = object;
    const { currentTarget, target } = event;

    const checkContainsClass = target.classList.contains('show-more-btn');
    const ariaExpanded = element.getAttribute('aria-expanded');
    this.checkExp = ariaExpanded === 'false';

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

    // list and table
    if ((type === 'list' && checkContainsClass) || type === 'table') {
      const items =
        type === 'list' ? [].slice.call(currentTarget.children) : element.rows;

      for (let i = 0; i < items.length; i++) {
        const typeRemove =
          type === 'list' ? i >= limit && i < items.length - 1 : i >= limit;

        if (ariaExpanded === 'false') {
          this.addRemClass(items[i], false);
        } else if (typeRemove) {
          this.addRemClass(items[i], true);
        }
      }
    }

    if (
      type === 'table' ||
      ((type === 'list' || type === 'text') && checkContainsClass)
    ) {
      this.setExpand({ ...object, target });
    }
  };

  addBtn = (object) => {
    const { type, element, more, typeElement } = object;

    if (!more) {
      return;
    }

    if (type === 'table') {
      element.insertAdjacentElement('afterend', this.createBtn(object));
    } else {
      const el = document.createElement(typeElement);
      el.appendChild(this.createBtn(object));
      element.appendChild(el);
    }
  };

  // number of hidden items
  getNumber = ({ rows, children }, type) => {
    const elementType = type === 'table' ? rows : children;

    const numbersElementHidden = [].slice
      .call(elementType)
      .filter((el) => el.className === 'hidden').length;
    return numbersElementHidden !== 0 ? ` ${numbersElementHidden}` : '';
  };

  setExpand = (object) => {
    const { element, type, less, more, number, target } = object;
    const typeAria = this.checkExp ? less : more;
    const aria = this.checkExp ? 'expand' : 'collapse';
    const ariaText = type === 'table' ? type : `the ${type}`;
    const lastChild = element.lastElementChild;

    element.setAttribute('aria-expanded', this.checkExp);
    target.setAttribute('aria-label', `${aria} ${ariaText}`);

    // callback function on more/less
    this.onMoreLess(aria, object);

    if (typeAria) {
      target.innerHTML = number
        ? typeAria + this.getNumber(element, type)
        : typeAria;
    } else if (type === 'table') {
      target.parentNode.removeChild(target);
    } else if (type === 'list') {
      lastChild.parentNode.removeChild(lastChild);
    }
  };
}

export default ShowMore;