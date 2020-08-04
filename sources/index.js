class ShowMore {
  constructor(className, { type, more, less }) {
    this.className = className;
    this.typeElement = type || 'span';
    this.more = more;
    this.less = less || '';
    this.showMore = `<span class="show-more show-more-button" aria-label="expand" tabindex="0">${more}</span>`;
    this.showLess = `<span class="show-less show-more-button" aria-label="collapse" tabindex="0">${less}</span>`;
    this.regex = {
      newLine: /[^\x20-\x7E]/gm,
      space: /\s{2,}/gm,
      br: /<\s*\/?br\s*[/]?>/gm,
    };
    this.render();
  }

  render() {
    const elements = document.querySelectorAll(`.${this.className}`);

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
        originalText
          .replace(this.regex.newLine, '')
          .replace(this.regex.space, ' ')
          .replace(this.regex.br, '').length -
        element.innerText.replace(this.regex.newLine, '').length;

      if (element.innerText.length > limitCounts) {
        truncatedText = originalText
          .replace(this.regex.newLine, '')
          .replace(this.regex.space, ' ')
          .replace(this.regex.br, ' ')
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
      let typeLogic;

      if (type === 'text') {
        if (target.classList.contains('show-more-button')) {
          element.innerHTML = '';
          element.innerHTML = ariaExpanded === 'false' ? originalText : truncatedText;

          const typeLess = this.less ? this.showLess : '';
          const el = document.createElement(this.typeElement);
          el.insertAdjacentHTML('beforeend', ariaExpanded === 'false' ? typeLess : this.showMore);

          if (ariaExpanded === 'true') {
            this.dataExpanded(element, target, this.more, type, false);
          } else {
            this.dataExpanded(element, target, this.less, type, true);
          }

          element.appendChild(el);
        }
      }

      if (type === 'list') {
        if (target.classList.contains('show-more-button')) {
          const elements = [].slice.call(currentTarget.children);
          for (let i = 0; i < elements.length; i++) {
            if (ariaExpanded === 'false') {
              elements[i].classList.remove('hidden');
              typeLogic = true;
            }

            if (ariaExpanded === 'true' && i >= limit && i < elements.length - 1) {
              elements[i].classList.add('hidden');
              typeLogic = false;
            }
          }
          this.dataExpanded(element, target, typeLogic ? this.less : this.more, type, typeLogic);
        }
      }

      if (type === 'table') {
        const { rows } = element;
        if (ariaExpanded === 'false') {
          for (let i = 0; i < rows.length; i++) {
            rows[i].classList.remove('hidden');
            typeLogic = true;
          }
        } else {
          for (let i = limit; i < rows.length; i++) {
            rows[i].classList.add('hidden');
            typeLogic = false;
          }
        }
        this.dataExpanded(element, target, typeLogic ? this.less : this.more, type, typeLogic);
      }
    });
  }

  dataExpanded(element, target, button, type, logic) {
    const ariaLabelText = type === 'table' ? type : `the ${type}`;
    const expandCollapse = logic ? 'collapse' : 'expand';
    const lastChildElement = element.lastElementChild;

    element.setAttribute('aria-expanded', logic);
    target.innerHTML =
      button || type === 'table'
        ? target.parentNode.removeChild(target)
        : lastChildElement.parentNode.removeChild(lastChildElement);
    target.setAttribute('aria-label', `${expandCollapse} ${ariaLabelText}`);
  }
}

export default ShowMore;
