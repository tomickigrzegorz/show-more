<h1 align="center">
  show More/Less
</h1>

<p align="center">
  JavaScript library that truncates text, list or table by chars, elements or row and shows/hides text blocks, elements or table row with Show More and Show Less.
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/tomik23/show-more">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg">
  </a>
</p>

<p align="center">
  <img src="static/01.png">
</p>

## Demo
See the demo - [example](https://tomik23.github.io/show-more/)

## Clone the repo and install dependencies
```js
git clone
cd show-more

yarn
// or
npm i
```
## Watch/Build the app
Watch the app, just call:

```js
yarn dev
// or
npm run dev
```

Build app:

```js
yarn prod
// or
npm run prod
```

## How to use it:

### Add css and js library to html

```html
<link rel="stylesheet" href="style.css">
<script src="showMore.min.js"></script>
```
---
### For text → [live example](https://tomik23.github.io/show-more#example-text):
```html
<div class="example-text" data-type="text" data-number="80" data-after="30">
  Lorem ipsum, dolor ...
  ...
</div>
```

```js
new ShowMore('example-text', {
  more: ' → show more',
  less: ' ← less'
});
```
---
### For list → [live example](https://tomik23.github.io/show-more#example-list):
```html
<ul class="example-list" data-type="list" data-number="5" data-after="3">
  <li>Import item 1</li>
  <li>Import item 2</li>
  ...
</ul>
```
```js
new ShowMore('example-list', {
  type: 'li',
  more: ' → show more',
  less: ' ← less'
});
```
---

```html
<div class="example-list-b" data-type="list" data-number="5" data-after="3">
  <a href="#">item 1</a>
  <a href="#">item 2</a>
  ...
</div>
```
```js
new ShowMore('example-list-b', {
  more: ' → show more',
  less: ' ← less'
});
```
---

### For table → [live example](https://tomik23.github.io/show-more#example-table):
```html
<table class="example-table" data-type="table" data-number="2" data-after="3">
  ...
</table>
```

```js
new ShowMore('example-table', {
  more: ' → show more',
  less: ' ← less'
});
```

### Only expandable 
```js
new ShowMore('example-c', {
  more: ' → show more'
});
```

| element | description |
|--------------- |-------------|
| `data-type` | we have three type after which it will be hidden [text, list or table] |
| `data-number` | `text` after how many characters to hide the text and insert `show more/less`<br />`list` or `table` after how many elements/rows hide the rest and insert `show more/less` |
| `data-after` | this parameter allows you to set how much text/elements/rows <br />should be after the `show more/less button`^. |

> ^ Let's say we have 20 records with text and we determine that the text is to be trimmed after 100 characters in each record, it may happen that in several records the text is very short and has 110 characters, so `show more/less` will appear after 100 characters and after clicking an additional 10 characters, it will look funny. To prevent this, we add the `data-after="50"` parameter, which means that the hidden text must be at least 50 characters. Otherwise, `show more/less` will not appear. The same `data-after` can be applied to lists, elements and table records

> Number of records counted in the table `tr` based on all `tr` of `thead`, `tbody` and `tfoot`

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // text, table, list, elelemnts
  new ShowMore('your-class', {

    // [div, li, a, ...] parameter not required
    type: 'span',

    // text before expanding 
    more: ' → show more',

    // expanded text is not required
    // if it is not set, the element
    // cannot be collapsed
    less: ' ← less'
  });
});
```

| element | description |
|----------|-------------|
| `your-class` | name of the class after which we want to add support for showing/hiding text, list or table |
| `type` | on the parameter we will create an html element and put in the text `show more/less` |
| `more/less` | is the text and chars that appears after the text, list or table e.g. `> show more` and  `< show less` |


## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png" alt="Vivaldi" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Vivaldi |
| --------- | --------- | --------- | --------- | --------- |
| IE10+, Edge| last 2 versions| last 2 versions| last 2 versions| last 2 versions