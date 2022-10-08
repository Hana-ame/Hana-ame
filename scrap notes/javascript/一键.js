javascript: (
  async function() {
    let url = new URL(location.href);
    if (location.href.startsWith("https://oversea.cnki.net")){ /* oversea */ 
      t = location.href.replace("https://oversea.cnki.net", "https://kns.cnki.net");  
      location.href = t;
    }else if (location.href.startsWith("https://kns.cnki.net")){
      t = location.href.replace("https://kns.cnki.net", "https://oversea.cnki.net"); 
      location.href = t;
    }else if (location.href.startsWith("https://exhentai.org/") || location.href.startsWith("https://e-hentai.org/")){    
      /* TODO: when fetch failed, add some  handler */
      'use strict';
      var picsNext = document.createElement('div');
      var lastPrev = location.href;
      var lastNext = location.href;
      const element = document.getElementById('i1');
      element.appendChild(picsNext);
      var hrefNext = document.getElementById('next').href;
      while (hrefNext != lastNext) {
        var doc = await fetch(hrefNext).then(resp => resp.text())
        .then(data => {
          console.log(data);
          var parser = new DOMParser();
          var doc = parser.parseFromString(data, "text/html");
          return doc;
        });
        console.log(doc);
        let img = document.createElement('img');
        let element = doc.getElementById('img');
        img.src = element.src;
        picsNext.appendChild(img);
        lastNext = hrefNext;
        hrefNext = doc.getElementById('next').href;
      }
    }else if (url.href.startsWith(`https://www.vocabulary.com/dictionary/`)){
      word = url.href.replace(`https://www.vocabulary.com/dictionary/`,``).toLowerCase();      
      if (word !== undefined){
        navigator.clipboard.readText()
          .then( (clipText) =>{
            console.log(clipText); 
            var newText = clipText +'\n * '+'['+word+']'+'('+url.href+')';
            console.log(newText); 
            navigator.clipboard.writeText(newText);
          });
      }
    }else if(url.href.startsWith(`https://www.google.com`)){
      var re = /q=([\w+-]+)&?/g; 
      var arr = re.exec(url.href);
      word = arr[1];
      /* var url = `https://www.google.com/search?q=`+word; */ /* not verified, if the name is shadowed */
      let url = new URL('https://google.com/search'); /* let should be the first time the name appears in this code block */
      url.searchParams.set('q', word); 
      word = word.replaceAll('+',' ').toLowerCase();      
      if (word !== undefined){
        navigator.clipboard.readText()
          .then( (clipText) =>{
            console.log(clipText); 
            var newText = clipText +'\n * '+'['+word+']'+'('+url.href+')';
            console.log(newText); 
            navigator.clipboard.writeText(newText);
          });
      }
    }else if(url.hostname == `www.wenku8.net`){
      let host = document.location.host;
      let url = encodeURIComponent(document.location.href);
      console.log(`read://https_${host}/?url=${url}`);
      /* window.location.href = `read://https_${host}/?url=${url}`; */
      navigator.clipboard.writeText(`read://https_${host}/?url=${url}`);
    }else if([`bzNvLmNh`,`bW9uYS5kbw==`,`d3h3Lm1vZQ==`,`d3d3Lnd4dy5tb2U=`].includes(window.btoa(url.hostname))){
      var blurByXpath = function(xpath){
        let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null );
        console.log(iter);
        try {
          var thisNode = iter.iterateNext();    
          while (thisNode) {
          console.log( thisNode.textContent );
          thisNode.style.setProperty('filter','blur(4px)');
          thisNode = iter.iterateNext();
          }
        }
        catch (e) {
          console.log(e);
        }
      };
      blurByXpath('//img[contains(@class,"u-photo")]');
      blurByXpath('//*[@class="display-name"]');
      blurByXpath('//*[@class="h-card"]');
      blurByXpath('//bdi');
      blurByXpath('//*[@class="status__avatar"]');
      blurByXpath('//*[@class="account__header__tabs__name"]//small');
      blurByXpath('//*[@class="public-account-header__tabs__name"]//small');
    }
})();