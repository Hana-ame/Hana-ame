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
    }else if(window.btoa(url.hostname) == 'd3h3Lm1vZQ=='){
      arr = [
        `aHR0cHM6Ly93eHcubW9lL3dlYi9ASGFydVVyYXJhL3dpdGhfcmVwbGllcw==`,
        `aHR0cHM6Ly93eHcubW9lL3dlYi9Aamlhbmd4aWF4aWF4aWEvd2l0aF9yZXBsaWVz`,
      ];
      let nextIndex = arr.findIndex(e => e==window.btoa(url.href))+1;
      if (nextIndex >= arr.length) nextIndex = 0;
      location.href = window.atob(arr[nextIndex]);
      /* for the time present, it will reload the whole page so not really want to use it, maybe find a way to crawl it with RSS (but i lost the post that explane the RSS...) */
    }
})();