javascript: (
  async function() {
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
    }else if (url.startsWith(`https://www.vocabulary.com/dictionary/`)){
      word = url.replace(`https://www.vocabulary.com/dictionary/`,``).toLowerCase();      
      if (word !== undefined){
        navigator.clipboard.readText()
          .then( (clipText) =>{
            console.log(clipText); 
            var newText = clipText +'\n * '+'['+word+']'+'('+url+')';
            console.log(newText); 
            navigator.clipboard.writeText(newText);
          });
      }
    }else if(url.startsWith(`https://www.google.com`)){
      var re = /q=([\w+-]+)&?/g; 
      var arr = re.exec(url);
      word = arr[1];
      url = `https://www.google.com/search?q=`+word;
      word = word.replaceAll('+',' ').toLowerCase();      
      if (word !== undefined){
        navigator.clipboard.readText()
          .then( (clipText) =>{
            console.log(clipText); 
            var newText = clipText +'\n * '+'['+word+']'+'('+url+')';
            console.log(newText); 
            navigator.clipboard.writeText(newText);
          });
      }
    }
})();