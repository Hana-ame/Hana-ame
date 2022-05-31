javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();
javascript:(function(){})();


snapshot = document.evaluate (    
    "//div[@class='avatar']/img",   
    document,
    null, 
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, 
    null);
console.log(snapshot.snapshotLength)  // 输出结果为 1， 即证明所使用的XPath正确。

// Xpath 查找然后改变
var iterator = document.evaluate('//div[@class="h-threads-item uk-clearfixe"]//*[@class="h-threads-content"]', document, null, XPathResult.ANY_TYPE, null );
try {
    var thisNode = iterator.iterateNext();
  
    while (thisNode) {
      console.log( thisNode.textContent );
      thisNode.style.setProperty('filter','blur(20px)')
      thisNode = iterator.iterateNext();
    }
  }
  catch (e) {
    console.log( 'Error: Document tree modified during iteration ' + e );
  }     ;

  