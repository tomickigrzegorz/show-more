class ShowMore {
  constructor(options) {
    this.className = `.${options.class}`;
    this.showMore = ` <span class="showMore">${options.more}</span>`;
    this.showLess = ` <span class="showLess">${options.less}</span>`;
    this.render();
  }

  render() {
    const elements = document.querySelectorAll(this.className);

    for (let i = 0; i < elements.length; i++) {
      const type = elements[i].getAttribute('data-type');
      const limit = Number(elements[i].getAttribute('data-number'));

      const text = this.showMoreText(elements[i], limit);
      const list = this.showMoreList(elements[i], limit);
      // eslint-disable-next-line no-unused-expressions
      type === 'text' ? text : list;
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
      element.insertAdjacentHTML('beforeend', this.showMore);

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
        e.currentTarget.insertAdjacentHTML(
          'beforeend',
          className === 'showMore' ? this.showLess : this.showMore
        );
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
      const li = document.createElement('li');
      li.insertAdjacentHTML('beforeend', this.showMore);
      element.appendChild(li);

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

        const li = document.createElement('li');
        li.insertAdjacentHTML('beforeend', isOpen ? this.showLess : this.showMore);

        element.appendChild(li);
      }
    });
  }
}

export default ShowMore;
