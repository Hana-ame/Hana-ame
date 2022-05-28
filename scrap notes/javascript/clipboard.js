// t = https://www.vocabulary.com/dictionary/dreary
var url = location.href;
var word;
if (url.startsWith(`https://www.vocabulary.com/dictionary/`)){
  word = url.replace(`https://www.vocabulary.com/dictionary/`,``).toLowerCase();
}else if(url.startsWith(`https://www.google.com`)){
  var re = /q=([\w+-]+)&?/g; 
  var arr = re.exec(url);
  word = arr[1];
  url = `https://www.google.com/search?q=`+word;
  word = word.replaceAll('+',' ').toLowerCase();
}
if (word !== undefined){
  navigator.clipboard.readText()
    .then( (clipText) =>{
      console.log(clipText); 
      var newText = clipText +'\n * '+'['+word+']'+'('+url+')';
      console.log(newText); 
      navigator.clipboard.writeText(newText);
    });
}


