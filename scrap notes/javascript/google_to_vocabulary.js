javascript:(
    function(){
        var t = location.href;
        // var re = new RegExp("q=(\\w+)&", "g");
        var re = /q=(\w+)&/g; // alternative
        var arr = re.exec(t);
        var w = arr[1];
        location.href = "https://www.vocabulary.com/dictionary/" + w;
    }
)();

// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions