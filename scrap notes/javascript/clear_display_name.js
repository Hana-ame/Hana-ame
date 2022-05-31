let c = document.getElementsByClassName(`display-name__account`);
let re = /^(?:\s|\n)*(@\w+)/g; 
for (let i=0;i<c.length;i++){
    let e = c.item(i);
    /* console.log(e.textContent); */
    re.lastIndex = 0;
    let arr = re.exec(e.textContent);
    /* console.log(arr); */
    e.textContent = arr[1];
}

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
    }())
  //   (function(){
  //     {
  //       let c = document.getElementsByClassName(`display-name__account`);
  //       let re = /^(?:\s|\n)*(@\w+)/g; 
  //       for (let i=0;i<c.length;i++){
  //         let e = c.item(i);
  //         /* console.log(e.textContent); */
  //         re.lastIndex = 0;
  //         let arr = re.exec(e.textContent);
  //         /* console.log(arr); */
  //         e.textContent = arr[1];
  //       }
  //     }    
      
  //     {
  //       // let iter = document.evaluate('//img[@class="u-photo account__avatar"]', document, null, XPathResult.ANY_TYPE, null );
  //       let iter = document.evaluate('//img[contains(@class,"u-photo")]', document, null, XPathResult.ANY_TYPE, null );
  //       try {
  //         var thisNode = iter.iterateNext();       
  //         while (thisNode) {
  //          console.log( thisNode.textContent );
  //          thisNode.style.setProperty('filter','blur(4px)')
  //          thisNode = iter.iterateNext();
  //         }
  //       }
  //       catch (e) {
  //         console.log( e );
  //       }
  //     }
  //     {
  //       let iter = document.evaluate('//*[@class="display-name"]', document, null, XPathResult.ANY_TYPE, null );
  //       try {
  //         var thisNode = iter.iterateNext();       
  //         while (thisNode) {
  //          console.log( thisNode.textContent );
  //          thisNode.style.setProperty('filter','blur(4px)')
  //          thisNode = iter.iterateNext();
  //         }
  //       }
  //       catch (e) {
  //         console.log( e );
  //       }
  //     }   
  //     {
  //       let iter = document.evaluate('//*[@class="h-card"]', document, null, XPathResult.ANY_TYPE, null );
  //       try {
  //         var thisNode = iter.iterateNext();       
  //         while (thisNode) {
  //          console.log( thisNode.textContent );
  //          thisNode.style.setProperty('filter','blur(4px)')
  //          thisNode = iter.iterateNext();
  //         }
  //       }
  //       catch (e) {
  //         console.log( e );
  //       }
  //     }   
  //     {
  //       let iter = document.evaluate('//bdi', document, null, XPathResult.ANY_TYPE, null );
  //       try {
  //         var thisNode = iter.iterateNext();       
  //         while (thisNode) {
  //          console.log( thisNode.textContent );
  //          thisNode.style.setProperty('filter','blur(4px)')
  //          thisNode = iter.iterateNext();
  //         }
  //       }
  //       catch (e) {
  //         console.log( e );
  //       }
  //     }   
  //     {
  //       let iter = document.evaluate('//*[@class="status__avatar"]', document, null, XPathResult.ANY_TYPE, null );
  //       try {
  //         var thisNode = iter.iterateNext();       
  //         while (thisNode) {
  //          console.log( thisNode.textContent );
  //          thisNode.style.setProperty('filter','blur(4px)')
  //          thisNode = iter.iterateNext();
  //         }
  //       }
  //       catch (e) {
  //         console.log( e );
  //       }
  //     }             
  //   }
  // )()
  );