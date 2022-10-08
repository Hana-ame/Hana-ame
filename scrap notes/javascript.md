
```
(function(){console.log(1)})();
```
和
```
(function(){console.log(1)}());
```
没差啊……


# Xpath
```
var t = document.evaluate('//div[@class="h-threads-item uk-clearfixe"]//*[@class="h-threads-content"]', document, null, XPathResult.ANY_TYPE, null );
```

var t = document.evaluate('//div[@class="h-threads-item uk-clearfixe"]//*[@class="h-threads-content"]', document, null, XPathResult.ANY_TYPE, null );
try {
  var thisNode = iterator.iterateNext();

  while (thisNode) {
    console.log( thisNode.textContent );
    thisNode.
    thisNode = iterator.iterateNext();
  }
}
catch (e) {
  console.log( 'Error: Document tree modified during iteration ' + e );
}

[script/clear-display-name.js]


----
草，vimium夹在bookmark会错乱，长度有限制。
直接点就没问题

```js
const arr =[];
for(const v of arr){
    console.log(window.btoa(v));
}
```