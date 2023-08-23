```js

const button = document.createElement('button');
button.innerHTML = '+';
button.addEventListener("click", click, false);
const div = document.createElement('div');
div.appendChild(button);

let xpath = '//div[@class="focusable detailed-status__wrapper"]/div[@class="detailed-status__action-bar"]';
let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
let node = iter.iterateNext();
console.log(node);
node.appendChild(div);
```