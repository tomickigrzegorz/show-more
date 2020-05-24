class ShowMore {
  constructor(options) {
    this.className = `.${options.class}`;
    this.typeElement = options.show.type || 'span';
    this.more = options.show.more;
    this.less = options.show.less;
    this.showMore = `<span class="showMore showMoreButton">${options.show.more}</span>`;
    this.showLess = `<span class="showLess showMoreButton">${options.show.less}</span>`;
    this.regex = /(\r\n|\n|\r)/gm;
    this.render();
  }

  render() {
    const elements = document.querySelectorAll(this.className);

    for (let i = 0; i < elements.length; i++) {
      const dataLimit = elements[i].getAttribute('data-number');
      const dataType = elements[i].getAttribute('data-type');
      this.init(dataType, elements[i], +dataLimit);
    }
  }

  init(type, element, limit) {
    element.setAttribute('aria-expanded', 'false');

    if (type === 'text') {
      const originalText = element.innerHTML;

      let truncatedText = '';
      const differenceBetweenHTMLaTEXT =
        originalText.replace(this.regex, ' ').length -
        element.innerText.replace(this.regex, ' ').length;

      if (originalText.length > limit) {
        truncatedText = originalText.substr(0, limit + differenceBetweenHTMLaTEXT);
        truncatedText = truncatedText.substr(
          0,
          Math.min(truncatedText.length, truncatedText.lastIndexOf(' '))
        );

        element.innerHTML = truncatedText;

        this.appendControls({ type, element, originalText, truncatedText });
      }
    }

    if (type === 'list') {
      const elements = [].slice.call(element.children);
      if (elements.length > limit) {
        for (let i = limit; i < elements.length; i++) {
          elements[i].classList.add('hidden');
        }
        this.appendControls({ type, element, limit });
      }
    }

    if (type === 'table') {
      const { rows } = element;
      if (rows.length > limit) {
        for (let i = limit; i < rows.length; i++) {
          rows[i].classList.add('hidden');
        }
      }
      this.appendControls({ type, element, limit });
    }
  }

  appendControls({ type, element, limit, originalText, truncatedText }) {
    let newElement;

    if (type === 'table') {
      element.insertAdjacentHTML('afterend', this.showMore);
      newElement = element.nextElementSibling;
    } else {
      const el = document.createElement(this.typeElement);
      el.innerHTML = this.showMore;
      element.appendChild(el);
      newElement = element;
    }

    newElement.addEventListener('click', ({ currentTarget, target }) => {
      const ariaExpanded =
        type === 'table'
          ? currentTarget.previousElementSibling.getAttribute('aria-expanded')
          : currentTarget.getAttribute('aria-expanded');

      if (type === 'text') {
        if (target.classList.contains('showMoreButton')) {
          element.innerHTML = '';
          element.innerHTML =
            ariaExpanded === 'false' ? originalText : truncatedText.replace(this.regex, ' ');

          const el = document.createElement(this.typeElement);
          el.insertAdjacentHTML(
            'beforeend',
            ariaExpanded === 'false' ? this.showLess : this.showMore
          );

          if (ariaExpanded === 'true') {
            this.dataExpanded(element, target, this.more, 'false');
          } else {
            this.dataExpanded(element, target, this.less, 'true');
          }

          element.appendChild(el);
        }
      }

      if (type === 'list') {
        if (target.classList.contains('showMoreButton')) {
          const elements = [].slice.call(currentTarget.children);
          for (let i = 0; i < elements.length; i++) {
            if (ariaExpanded === 'false') {
              elements[i].classList.remove('hidden');
              this.dataExpanded(element, target, this.less, 'true');
            }

            if (ariaExpanded === 'true' && i >= limit && i < elements.length - 1) {
              elements[i].classList.add('hidden');
              this.dataExpanded(element, target, this.more, 'false');
            }
          }
        }
      }

      if (type === 'table') {
        const { rows } = element;
        if (ariaExpanded === 'false') {
          for (let i = 0; i < rows.length; i++) {
            rows[i].classList.remove('hidden');
          }
          this.dataExpanded(element, target, this.less, 'true');
        } else {
          for (let i = limit; i < rows.length; i++) {
            rows[i].classList.add('hidden');
          }
          this.dataExpanded(element, target, this.more, 'false');
        }
      }
    });
  }

  dataExpanded(element, target, button, type) {
    element.setAttribute('aria-expanded', type);
    target.innerHTML = button;
  }

  getTableColumnCount(table) {
    let columnCount = 0;
    const { rows } = table;

    if (rows.length > 0) {
      const { cells } = rows[0];
      for (let i = 0, len = cells.length; i < len; ++i) {
        columnCount += cells[i].colSpan;
      }
    }
    return columnCount;
  }
}

export default ShowMore;
