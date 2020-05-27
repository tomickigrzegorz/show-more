class ShowMore {
  constructor(className, { type, more, less }) {
    this.className = className;
    this.typeElement = type || 'span';
    this.more = more;
    this.less = less;
    this.showMore = `<span class="showMore showMoreButton">${more}</span>`;
    this.showLess = `<span class="showLess showMoreButton">${less}</span>`;
    this.regex = /^\s*[\r\n]?/gm;
    this.render();
  }

  render() {
    const elements = document.querySelectorAll(this.className);

    for (let i = 0; i < elements.length; i++) {
      const dataLimit = elements[i].getAttribute('data-number');
      const dataLimitAfter = elements[i].getAttribute('data-after');
      const dataType = elements[i].getAttribute('data-type');
      this.init(dataType, elements[i], +dataLimit, +dataLimitAfter);
    }
  }

  init(type, element, limit, after) {
    element.setAttribute('aria-expanded', 'false');
    const limitCounts = limit + after;

    if (type === 'text') {
      const originalText = element.innerHTML;
      let truncatedText = '';
      const differenceBetweenHTMLaTEXT =
        originalText.replace(this.regex, '').length -
        element.innerText.replace(this.regex, '').length;

      if (element.innerText.length > limitCounts) {
        truncatedText = originalText
          .replace(this.regex, '')
          .substr(0, limit + differenceBetweenHTMLaTEXT);
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
      if (elements.length > limitCounts) {
        for (let i = limit; i < elements.length; i++) {
          elements[i].classList.add('hidden');
        }
        this.appendControls({ type, element, limit });
      }
    }

    if (type === 'table') {
      const { rows } = element;
      if (rows.length > limitCounts) {
        for (let i = limit; i < rows.length; i++) {
          rows[i].classList.add('hidden');
        }
        this.appendControls({ type, element, limit });
      }
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
}

export default ShowMore;
