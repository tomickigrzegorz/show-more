<h1 align="center">
  show More/Less
</h1>

<p align="center">
  JavaScript library that truncates text, list or table by chars, elements or row and shows/hides text blocks, elements or table row with Show More and Show Less.
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/tomik23/show-more">
  <img src="https://img.shields.io/github/size/tomik23/show-more/docs/showMore.min.js">
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
<img src="https://cdn.jsdelivr.net/www.jsdelivr.com/4a8e863f4c627929f243db3360393a7eed05238c/img/logo-horizontal.svg">

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/tomik23/show-more@master/docs/style.css">
<script src="https://cdn.jsdelivr.net/gh/tomik23/show-more@master/docs/showMore.min.js"></script>
```

---
### For text → [live example](https://tomik23.github.io/show-more#example-text):
```html
<div class="element" data-config='{ "type": "text", "limit": 120, "more": "→ show more", "less": "← less" }'>
  Lorem ipsum, dolor ...
  ...
</div>
```

---
### For list → [live example](https://tomik23.github.io/show-more#example-list):
```html
<ul class="element" data-config='{ "type": "list", "limit": 5, "element": "li", "more": "↓ show more", "less": "↑ less", "number": true }'>
  <li>item 1</li>
  <li>item 2</li>
  ...
</ul>
```
---

### For table → [live example](https://tomik23.github.io/show-more#example-table):
```html
<table class="element" data-config='{ "type": "table", "limit": 4, "more": "↓ show more", "less": "↑ less", "number": true }'>
  ...
</table>
```
---

### Only `show more` button → [live example](https://tomik23.github.io/show-more#example-onlyexpandable):
```html
<div class="element links-style" data-config='{ "type": "list", "limit": 5, "more": "→ show more" }'>
  <a href="#">Administracja biur,</a>
</div>
```
---

### Only ellipsis → [live example](https://tomik23.github.io/show-more#ellipsis):
```html
<div class="element" data-config='{ "type": "text", "limit": 100, "ellipsis": " ..." }'>
  It is a long established fact that a reader will be distracted by the readable content of a page when looking
  at its layout.
</div>
```
---

### Show the number next to the button  → [live example](https://tomik23.github.io/show-more#show-number):
```html
<ul class="element display-inline" data-config='{ "type": "list", "limit": 3, "element": "li", "more": "→ show more", "less": "← less", "number": true }'>
  <li>Usługi murarskie i tynkarskie,</li>
  ...
</ul>
```

| element | description |
|--------------- |-------------|
| `your-class` | name of the class after which we want to add support for showing/hiding text, list or table |
| `data-config` | embedding JSON in the html, the entire configuration of a particular element  |
| `type` | we have three type after which it will be hidden [text, list or table] |
| `limit` | `text` after how many characters to hide the text and insert `show more/less`<br />`list` or `table` after how many elements/rows hide the rest and insert `show more/less` |
| `after` | this parameter checks how much text is after the trimmed text the `limit` parameter, if the text is less than the `after` parameter does not add a more/less button`^. |
| `element` | on the parameter we will create an html element and put in the text `show more/less` |
| `more/less` | is the text and chars that appears after the text, list or table e.g. `> show more` and  `< show less` |
| `number` | number of hidden items to show more/less e.g. `-> show more 3`, only works for list and table |
| `ellipsis` | show only the ellipsis |
| `onAction` | callback function |


> ^ Let's say we have 20 records with text and we determine that the text is to be trimmed after 100 characters in each record, it may happen that in several records the text is very short and has 110 characters, so `show more/less` will appear after 100 characters and after clicking an additional 10 characters, it will look funny. To prevent this, we add the `"after": 50` parameter, which means that the hidden text must be at least 50 characters. Otherwise, `show more/less` will not appear. The same `after` can be applied to lists, elements and table records

> Number of records counted in the table `tr` based on all `tr` of `thead`, `tbody` and `tfoot`

## Function call

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // text, table, list, elelemnts
  new ShowMore('.element', {
    onAction: (type, object) => {
      // type = less/more and full object
      console.log(typeAria, object);
    }
  });
});
```

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png" alt="Vivaldi" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Vivaldi |
| --------- | --------- | --------- | --------- | --------- |
| IE10+, Edge| last 2 versions| last 2 versions| last 2 versions| last 2 versions