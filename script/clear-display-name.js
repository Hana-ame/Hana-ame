javascript:(
    function(){
        {
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
        }        
        
        {
            // let iter = document.evaluate('//img[@class="u-photo account__avatar"]', document, null, XPathResult.ANY_TYPE, null );
            let iter = document.evaluate('//img[contains(@class,"u-photo")]', document, null, XPathResult.ANY_TYPE, null );
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
        {
            let iter = document.evaluate('//*[@class="display-name"]', document, null, XPathResult.ANY_TYPE, null );
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
        {
            let iter = document.evaluate('//*[@class="h-card"]', document, null, XPathResult.ANY_TYPE, null );
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
        
    }
)();