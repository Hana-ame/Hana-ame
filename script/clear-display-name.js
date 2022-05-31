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
            let iter = document.evaluate('//img[@class="u-photo account__avatar"]', document, null, XPathResult.ANY_TYPE, null );
            try {
                var thisNode = iter.iterateNext();              
                while (thisNode) {
                  console.log( thisNode.textContent );
                  thisNode.style.setProperty('filter','blur(20px)')
                  thisNode = iterator.iterateNext();
                }
            }
            catch (e) {
                console.log( 'Error: Document tree modified during iteration ' + e );
            }
        }
    }
)();