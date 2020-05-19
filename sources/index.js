class ShowMore {
  constructor(options) {
    const { type, more, less } = options.show;
    this.className = `.${options.class}`;
    this.type = type || 'span';
    this.more = more;
    this.more = less;
    this.showMore = ` <span class="showMore">${more}</span>`;
    this.showLess = ` <span class="showLess">${less}</span>`;
    this.render();
  }

  render() {
    const elements = document.querySelectorAll(this.className);

    for (let i = 0; i < elements.length; i++) {
      const limit = Number(elements[i].getAttribute('data-number'));
      const type = elements[i].getAttribute('data-type');
      switch (type) {
        case 'text':
          this.showMoreText(elements[i], limit);
          break;
        case 'list':
          this.showMoreList(elements[i], limit);
          break;
        case 'table':
          this.showMoreTable(elements[i], limit);
          break;
        default:
          break;
      }
    }
  }

  showMoreText(element, limit) {
    const originalText = element.innerHTML;
    let truncatedText = '';
    const differenceBetweenHTMLaTEXT =
      originalText.replace(/(\r\n|\n|\r)/gm, '').length -
      element.innerText.replace(/(\r\n|\n|\r)/gm, '').length;

    if (originalText.length > limit) {
      truncatedText = originalText.substr(0, limit + differenceBetweenHTMLaTEXT);
      truncatedText = truncatedText.substr(
        0,
        Math.min(truncatedText.length, truncatedText.lastIndexOf(' '))
      );
      element.innerHTML = truncatedText;

      const el = this.createElement(this.type);
      el.insertAdjacentHTML('beforeend', this.showMore);
      element.appendChild(el);

      this.appendControlsText(element, originalText, truncatedText);
    }
  }

  appendControlsText(element, originalText, truncatedText) {
    element.addEventListener('click', (e) => {
      const { className } = e.target;
      if (className === 'showMore' || className === 'showLess') {
        e.currentTarget.innerHTML = '';

        e.currentTarget.innerHTML =
          className === 'showMore' ? originalText : truncatedText.replace(/(\r\n|\n|\r)/gm, '');

        const el = document.createElement(this.type);
        el.insertAdjacentHTML(
          'beforeend',
          className === 'showMore' ? this.showLess : this.showMore
        );
        e.currentTarget.appendChild(el);
      }
    });
  }

  showMoreList(element, limit) {
    const elements = [].slice.call(element.children);
    if (elements.length > limit) {
      for (let i = 0; i < elements.length; i++) {
        if (i >= limit) {
          elements[i].classList.add('hidden');
        }
      }
      const el = this.createElement(this.type);
      el.insertAdjacentHTML('beforeend', this.showMore);
      element.appendChild(el);

      this.appendControlList(element, limit);
    }
  }

  appendControlList(element, limit) {
    element.addEventListener('click', (e) => {
      const { className } = e.target;
      if (className === 'showMore' || className === 'showLess') {
        element.classList.toggle('is-open');
        const isOpen = e.currentTarget.classList.contains('is-open');
        const elements = [].slice.call(e.currentTarget.children);

        for (let i = 0; i < elements.length; i++) {
          if (isOpen) {
            elements[i].classList.remove('hidden');
          } else if (i >= limit && i < elements.length - 1) {
            elements[i].classList.add('hidden');
          }
        }

        const last = elements[elements.length - 1];
        last.parentNode.removeChild(last);

        const el = this.createElement(this.type);
        el.insertAdjacentHTML('beforeend', isOpen ? this.showLess : this.showMore);

        element.appendChild(el);
      }
    });
  }

  showMoreTable(element, limit) {
    const { rows } = element.tBodies[0];

    if (rows.length > limit) {
      for (let i = 0; i < rows.length; i++) {
        if (i >= limit) {
          rows[i].classList.add('hidden');
        }
      }

      const tfoot = this.createElement('tfoot');
      const tr = this.createElement('tr');
      const th = this.createElement('th');
      tfoot.appendChild(tr);
      th.colSpan = this.getTableColumnCount(element);
      tr.appendChild(th);

      th.insertAdjacentHTML('beforeend', this.showMore);
      element.appendChild(tfoot);
    }
    this.appendControlsTable(element, limit);
  }

  appendControlsTable(element, limit) {
    element.addEventListener('click', (e) => {
      const { className } = e.target;
      const { rows } = element.tBodies[0];
      if (className === 'showMore') {
        e.target.innerHTML = '';
        for (let i = 0; i < rows.length; i++) {
          rows[i].classList.remove('hidden');
        }
        e.target.insertAdjacentHTML('beforeend', this.showLess);
      }
      if (className === 'showLess') {
        e.target.innerHTML = '';
        for (let i = 0; i < rows.length; i++) {
          if (i >= limit) {
            rows[i].classList.add('hidden');
          }
        }
        e.target.insertAdjacentHTML('beforeend', this.showMore);
      }
    });
  }

  createElement(element) {
    return document.createElement(element);
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
