class ShowMore {
  constructor(className, { onMoreLess = () => { } }) {
    this.elements = document.querySelectorAll(className);
    this.onMoreLess = onMoreLess;
    this.regex = {
      newLine: /[^\x20-\x7E]/gm,
      space: /\s{2,}/gm,
      br: /<\s*\/?br\s*[/]?>/gm,
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
        ellipsis: ellipsis || false,
        typeElement: element || 'span',
        more: more || false,
        less: less || false,
        number: number || false,
        after: after || 0,
      };
      this.initial(this.object);
    }
  }

  initial = ({ element, after, limit, type }) => {
    // set default aria-expande to false
    element.setAttribute('aria-expanded', 'false');
    const limitCounts = limit + after;

    if (type === 'text') {
      let truncatedText = '';
      const originalText = element.innerHTML;

      const orgTexReg = originalText
        .replace(this.regex.newLine, '')
        .replace(this.regex.space, ' ')
        .replace(this.regex.br, '');

      const differenceBetweenHTMLaTEXT =
        orgTexReg.length -
        element.innerText.replace(this.regex.newLine, '').length;

      if (element.innerText.length > limitCounts) {
        truncatedText = orgTexReg.substr(0, limit + differenceBetweenHTMLaTEXT);
        truncatedText = truncatedText.substr(
          0,
          Math.min(truncatedText.length, truncatedText.lastIndexOf(' '))
        );
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
    const aria = this.checkExp ? 'collapse' : 'expand';

    const btn = document.createElement('span');
    btn.className = 'show-more-btn';
    btn.setAttribute('aria-label', aria);
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
    const { type, element, more, ellipsis, typeElement } = object;

    if (type !== 'table' && !more && ellipsis) {
      const el = document.createElement('span');
      el.insertAdjacentHTML('afterbegin', ellipsis);
      element.appendChild(el);
      return;
    }

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
