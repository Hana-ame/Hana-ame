javascript:(
  function blur(xpath){
    let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null );
    try {
      var thisNode = iter.iterateNext();       
      while (thisNode) {
       console.log( thisNode.textContent );
       thisNode.style.setProperty('filter','blur(4px)')
       thisNode = iter.iterateNext();
      }
    }
    catch (e) {
      console.log( e );
    }
  }
  (function(){    
    blur('//img[contains(@class,"u-photo")]')
    blur('//*[@class="display-name"]')
    blur('//*[@class="h-card"]')
    blur('//bdi')
    blur('//*[@class="status__avatar"]')
  })
);