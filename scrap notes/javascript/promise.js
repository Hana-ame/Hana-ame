// ongoing

var url = location.href;
var word;
if (url.startsWith(`https://www.vocabulary.com/dictionary/`)){
    word = url.replace(`https://www.vocabulary.com/dictionary/`,``);
    navigator.clipboard.readText()
        .then( clipText =>{
            console.log(clipText);
            return new Promise( () => {
                return clipText;
            })
        }).then( r =>{ /* 这里是不运行的呃呃 */
            console.log(`=====`);
            console.log(r);
        }).then();
}