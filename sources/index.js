class ShowMore {
  constructor(options) {
    this.className = `.${options.class}`;
    this.typeElement = options.show.type || 'span';
    this.showMore = ` <span class="showMore">${options.show.more}</span>`;
    this.showLess = ` <span class="showLess">${options.show.less}</span>`;
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

        const el = this.createElement(this.typeElement);
        this.insertHTML(el, this.showMore);
        element.appendChild(el);

        this.appendControls({ type, element, originalText, truncatedText });
      }
    }

    if (type === 'list') {
      const elements = [].slice.call(element.children);
      if (elements.length > limit) {
        for (let i = limit; i < elements.length; i++) {
          elements[i].classList.add('hidden');
        }
        const el = this.createElement(this.typeElement);
        this.insertHTML(el, this.showMore);
        element.appendChild(el);

        this.appendControls({ type, element, limit });
      }
    }

    if (type === 'table') {
      const { rows } = element.tBodies[0];

      if (rows.length > limit) {
        for (let i = limit; i < rows.length; i++) {
          rows[i].classList.add('hidden');
        }

        const tfoot = this.createElement('tfoot');
        const tr = this.createElement('tr');
        const td = this.createElement('td');
        tfoot.appendChild(tr);
        td.colSpan = this.getTableColumnCount(element);
        tr.appendChild(td);

        this.insertHTML(td, this.showMore);
        element.appendChild(tfoot);
      }
      this.appendControls({ type, element, limit });
    }
  }

  appendControls({ type, element, limit, originalText, truncatedText }) {
    element.addEventListener('click', ({ currentTarget, target }) => {
      const { className } = target;
      if (type === 'text') {
        if (className === 'showMore' || className === 'showLess') {
          currentTarget.innerHTML = '';
          currentTarget.innerHTML =
            className === 'showMore' ? originalText : truncatedText.replace(this.regex, ' ');

          const el = document.createElement(this.typeElement);
          this.insertHTML(el, className === 'showMore' ? this.showLess : this.showMore);
          currentTarget.appendChild(el);
        }
      }

      if (type === 'list') {
        if (className === 'showMore' || className === 'showLess') {
          element.classList.toggle('expanded');
          const isOpen = currentTarget.classList.contains('expanded');
          const elements = [].slice.call(currentTarget.children);

          for (let i = 0; i < elements.length; i++) {
            if (isOpen) {
              elements[i].classList.remove('hidden');
            } else if (i >= limit && i < elements.length - 1) {
              elements[i].classList.add('hidden');
            }
          }

          const lastElement = elements[elements.length - 1];
          lastElement.parentNode.removeChild(lastElement);

          const el = this.createElement(this.typeElement);
          this.insertHTML(el, isOpen ? this.showLess : this.showMore);

          element.appendChild(el);
        }
      }

      if (type === 'table') {
        const { rows } = element.tBodies[0];
        const targetParent = target.parentNode;
        if (className === 'showMore') {
          targetParent.innerHTML = '';
          for (let i = 0; i < rows.length; i++) {
            rows[i].classList.remove('hidden');
          }
          this.insertHTML(targetParent, this.showLess);
        }
        if (className === 'showLess') {
          targetParent.innerHTML = '';
          for (let i = limit; i < rows.length; i++) {
            rows[i].classList.add('hidden');
          }
          this.insertHTML(targetParent, this.showMore);
        }
      }
    });
  }

  insertHTML(target, more) {
    return target.insertAdjacentHTML('beforeend', more);
  }

  createElement(element) {
    return document.createElement(element);
  }

  getTableColumnCount(table) {
    let columnCount = 0;
    const { rows } = table;
    if (table.length > 0) {
      const { cells } = rows[0];
      for (let i = 0, len = cells.length; i < len; ++i) {
        columnCount += cells[i].colSpan;
      }
    }
    return columnCount;
  }
}

export default ShowMore;
