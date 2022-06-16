javascript:(function(){ 
  function blurByXpath(xpath){
    let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null );
    console.log(iter)
    try {
      var thisNode = iter.iterateNext();    
      while (thisNode) {
      console.log( thisNode.textContent );
      thisNode.style.setProperty('filter','blur(4px)')
      thisNode = iter.iterateNext();
      }
    }
    catch (e) {
      console.log(e);
    }
  }  
  blurByXpath('//img[contains(@class,"u-photo")]')
  blurByXpath('//*[@class="display-name"]')
  blurByXpath('//*[@class="h-card"]')
  blurByXpath('//bdi')
  blurByXpath('//*[@class="status__avatar"]')
  blurByXpath('//*[@class="account__header__tabs__name"]//small')  
  blurByXpath('//*[@class="public-account-header__tabs__name"]//small')  

  navigator.clipboard.writeText(`function blurByXpath(xpath){
    let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null );
    console.log(iter)
    try {
      var thisNode = iter.iterateNext();    
      while (thisNode) {
      console.log( thisNode.textContent );
      thisNode.style.setProperty('filter','blur(4px)')
      thisNode = iter.iterateNext();
      }
    }
    catch (e) {
      console.log(e);
    }
  }  
  blurByXpath('//img[contains(@class,"u-photo")]')
  blurByXpath('//*[@class="display-name"]')
  blurByXpath('//*[@class="h-card"]')
  blurByXpath('//bdi')
  blurByXpath('//*[@class="status__avatar"]')
  blurByXpath('//*[@class="account__header__tabs__name"]//small')  
  blurByXpath('//*[@class="public-account-header__tabs__name"]//small')  
  `);
}());

