xpath = '//a'
let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null );
try {
    var thisNode = iter.iterateNext();       
    while (thisNode) {
        // console.log( thisNode.textContent );
        // console.log( thisNode.href );
        let re = /^https:\/\/exhentai.org\/s\/.*/g; 
        let arr = re.exec( thisNode.href );
        if(arr != null){
            console.log( arr );
            console.log( arr[0] );
            window.open( arr[0] )
        }

        thisNode = iter.iterateNext();       
    }
} catch (e) {
    console.log( e );
}