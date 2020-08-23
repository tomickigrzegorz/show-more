class ShowMore {
  constructor(className) {
    this.elements = document.querySelectorAll(className);
    this.regex = {
      newLine: /[^\x20-\x7E]/gm,
      space: /\s{2,}/gm,
      br: /<\s*\/?br\s*[/]?>/gm,
    };
    this.initial();
  }

  initial() {
    for (let i = 0; i < this.elements.length; i++) {
      const { type, limit, element, after, more, less, number } = JSON.parse(
        this.elements[i].getAttribute('data-config')
      );

      this.type = type;
      this.limit = +limit;
      this.typeElement = element || 'span';
      this.more = more;
      this.less = less || false;
      this.number = number || false;
      this.after = +after || 0;

      this.render(this.elements[i]);
    }
  }

  render(element) {
    element.setAttribute('aria-expanded', 'false');
    const limitCounts = this.limit + this.after;

    const object = {
      element,
      type: this.type,
      limit: this.limit,
      typeElement: this.typeElement,
      less: this.less,
      more: this.more,
      number: this.number,
    };

    if (this.type === 'text') {
      let truncatedText = '';
      const originalText = element.innerHTML;
      const differenceBetweenHTMLaTEXT =
        originalText
          .replace(this.regex.newLine, '')
          .replace(this.regex.space, ' ')
          .replace(this.regex.br, '').length -
        element.innerText.replace(this.regex.newLine, '').length;

      if (element.innerText.length > limitCounts) {
        truncatedText = originalText
          .replace(this.regex.newLine, '')
          .replace(this.regex.space, ' ')
          .replace(this.regex.br, '')
          .substr(0, this.limit + differenceBetweenHTMLaTEXT);
        truncatedText = truncatedText.substr(
          0,
          Math.min(truncatedText.length, truncatedText.lastIndexOf(' '))
        );

        element.innerHTML = truncatedText;

        this.addButton({ ...object, element });
        element.addEventListener(
          'click',
          this.handleEvent.bind(this, { ...object, originalText, truncatedText })
        );
      }
    }

    if (this.type === 'list') {
      const items = [].slice.call(element.children);
      if (items.length > limitCounts) {
        for (let i = this.limit; i < items.length; i++) {
          items[i].classList.add('hidden');
        }
        this.addButton({ ...object, element });
        element.addEventListener('click', this.handleEvent.bind(this, object));
      }
    }

    if (this.type === 'table') {
      const { rows } = element;
      if (rows.length > limitCounts) {
        for (let i = this.limit; i < rows.length; i++) {
          rows[i].classList.add('hidden');
        }
        element.insertAdjacentElement(
          'afterend',
          this.createButton({ ...object, elementClass: 'more', aria: 'collapse', element })
        );

        element.nextElementSibling.addEventListener('click', this.handleEvent.bind(this, object));
      }
    }
  }

  createButton({ elementClass, type, aria, more, less, element, number }) {
    const typeAria = aria === 'collapse' ? more : less;

    const btn = document.createElement('span');
    btn.className = `show-${elementClass} show-more-button`;
    btn.setAttribute('aria-label', aria);
    btn.setAttribute('tabindex', 0);
    btn.innerHTML = number ? typeAria + this.getNumber(element, type) : typeAria;
    return btn;
  }

  handleEvent(elements, event) {
    const { element, type, limit, typeElement, originalText, truncatedText } = elements;
    const { currentTarget, target } = event;

    const ariaExpanded = element.getAttribute('aria-expanded');
    this.logic = ariaExpanded === 'false';

    // text
    if (type === 'text' && target.classList.contains('show-more-button')) {
      element.innerHTML = '';
      element.innerHTML = ariaExpanded === 'false' ? originalText : truncatedText;

      const typeLess =
        ariaExpanded === 'false'
          ? this.createButton({ ...elements, elementClass: 'less', aria: 'expand', element })
          : this.createButton({ ...elements, elementClass: 'more', aria: 'collapse', element });

      const el = document.createElement(typeElement);
      el.insertAdjacentElement('beforeend', typeLess);

      this.setExpand({ ...elements, target });

      element.appendChild(el);
    }

    // list
    if (type === 'list' && target.classList.contains('show-more-button')) {
      // console.log('ok');
      const items = [].slice.call(currentTarget.children);
      for (let i = 0; i < items.length; i++) {
        if (ariaExpanded === 'false') {
          items[i].classList.remove('hidden');
        }

        if (ariaExpanded === 'true' && i >= limit && i < items.length - 1) {
          items[i].classList.add('hidden');
        }
      }
      this.setExpand({ ...elements, target });
    }

    // table
    if (type === 'table') {
      const { rows } = element;
      if (ariaExpanded === 'false') {
        for (let i = 0; i < rows.length; i++) {
          rows[i].classList.remove('hidden');
        }
      } else {
        for (let i = limit; i < rows.length; i++) {
          rows[i].classList.add('hidden');
        }
      }
      this.setExpand({ ...elements, target });
    }
  }

  addButton(object) {
    const { element, typeElement } = object;
    const el = document.createElement(typeElement);
    el.appendChild(
      this.createButton({ ...object, elementClass: 'more', aria: 'collapse', element })
    );
    element.appendChild(el);
  }

  // number of hidden items
  getNumber(element, type) {
    const elementType = type === 'table' ? element.rows : element.children;

    const numbersElementHidden = [].slice
      .call(elementType)
      .filter((el) => el.className === 'hidden').length;
    return numbersElementHidden !== 0 ? ` ${numbersElementHidden}` : '';
  }

  setExpand({ element, type, less, more, number, target }) {
    const button = this.logic ? less : more;
    const ariaLabelText = this.type === 'table' ? this.type : `the ${this.type}`;
    const expandCollapse = this.logic ? 'collapse' : 'expand';
    const lastChildElement = element.lastElementChild;

    element.getAttribute('aria-expanded');

    element.setAttribute('aria-expanded', this.logic);
    target.setAttribute('aria-label', `${expandCollapse} ${ariaLabelText}`);

    if (button) {
      target.innerHTML = number ? button + this.getNumber(element, type) : button;
    } else {
      if (this.type === 'table') {
        target.parentNode.removeChild(target);
      }
      if (this.type === 'list') {
        lastChildElement.parentNode.removeChild(lastChildElement);
      }
    }
  }
}

export default ShowMore;
