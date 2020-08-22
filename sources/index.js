class ShowMore {
  constructor(className, { type, more, less, showNumber }) {
    this.className = className;
    this.typeElement = type || 'span';
    this.more = more;
    this.less = less || false;
    this.showNumber = showNumber || false;
    this.regex = {
      newLine: /[^\x20-\x7E]/gm,
      space: /\s{2,}/gm,
      br: /<\s*\/?br\s*[/]?>/gm,
    };
    this.initial();
  }

  initial() {
    const elements = document.querySelectorAll(`.${this.className}`);

    for (let i = 0; i < elements.length; i++) {
      this.limit = +elements[i].getAttribute('data-number');
      this.limitAfter = +elements[i].getAttribute('data-after');
      this.type = elements[i].getAttribute('data-type');
      this.render(elements[i]);
    }
  }

  render(element) {
    element.setAttribute('aria-expanded', 'false');
    const limitCounts = this.limit + this.limitAfter;

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
        this.addButton(element);
        element.addEventListener(
          'click',
          this.handleEvent.bind(this, { element, originalText, truncatedText })
        );
      }
    }

    if (this.type === 'list') {
      const items = [].slice.call(element.children);
      if (items.length > limitCounts) {
        for (let i = this.limit; i < items.length; i++) {
          items[i].classList.add('hidden');
        }
        this.addButton(element);
        element.addEventListener('click', this.handleEvent.bind(this, { element }));
      }
    }

    if (this.type === 'table') {
      const { rows } = element;
      if (rows.length > limitCounts) {
        for (let i = this.limit; i < rows.length; i++) {
          rows[i].classList.add('hidden');
        }
        element.insertAdjacentElement('afterend', this.createButton('more', 'collapse', element));

        element.nextElementSibling.addEventListener(
          'click',
          this.handleEvent.bind(this, { element })
        );
      }
    }
  }

  createButton(elementClass, aria, element) {
    const type = aria === 'collapse' ? this.more : this.less;

    const btn = document.createElement('span');
    btn.className = `show-${elementClass} show-more-button`;
    btn.setAttribute('aria-label', aria);
    btn.setAttribute('tabindex', 0);
    btn.innerHTML = this.showNumber ? type + this._getNumber(element) : type;
    return btn;
  }

  handleEvent(elements, event) {
    const { element, originalText, truncatedText } = elements;
    const { currentTarget, target } = event;

    const ariaExpanded = element.getAttribute('aria-expanded');
    this.logic = ariaExpanded === 'false';

    // text
    if (this.type === 'text' && target.classList.contains('show-more-button')) {
      element.innerHTML = '';
      element.innerHTML = ariaExpanded === 'false' ? originalText : truncatedText;

      const typeLess =
        ariaExpanded === 'false'
          ? this.createButton('less', 'expand', element)
          : this.createButton('more', 'collapse', element);

      const el = document.createElement(this.typeElement);
      el.insertAdjacentElement('beforeend', typeLess);

      this.setExpand(element, target);

      element.appendChild(el);
    }

    // list
    if (this.type === 'list' && target.classList.contains('show-more-button')) {
      const items = [].slice.call(currentTarget.children);
      for (let i = 0; i < items.length; i++) {
        if (ariaExpanded === 'false') {
          items[i].classList.remove('hidden');
        }

        if (ariaExpanded === 'true' && i >= this.limit && i < items.length - 1) {
          items[i].classList.add('hidden');
        }
      }
      this.setExpand(element, target);
    }

    // table
    if (this.type === 'table') {
      const { rows } = element;
      if (ariaExpanded === 'false') {
        for (let i = 0; i < rows.length; i++) {
          rows[i].classList.remove('hidden');
        }
      } else {
        for (let i = this.limit; i < rows.length; i++) {
          rows[i].classList.add('hidden');
        }
      }
      this.setExpand(element, target);
    }
  }

  addButton(element) {
    const el = document.createElement(this.typeElement);
    el.appendChild(this.createButton('more', 'collapse', element));
    element.appendChild(el);
  }

  // number of hidden items
  _getNumber(element) {
    const elementType = this.type === 'table' ? element.rows : element.children;

    const numbersElementHidden = [].slice
      .call(elementType)
      .filter((el) => el.className === 'hidden').length;
    return numbersElementHidden !== 0 ? ` ${numbersElementHidden}` : '';
  }

  setExpand(element, target) {
    const button = this.logic ? this.less : this.more;
    const ariaLabelText = this.type === 'table' ? this.type : `the ${this.type}`;
    const expandCollapse = this.logic ? 'collapse' : 'expand';
    const lastChildElement = element.lastElementChild;

    element.setAttribute('aria-expanded', this.logic);
    target.setAttribute('aria-label', `${expandCollapse} ${ariaLabelText}`);

    if (button) {
      target.innerHTML = this.showNumber ? button + this._getNumber(element) : button;
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
