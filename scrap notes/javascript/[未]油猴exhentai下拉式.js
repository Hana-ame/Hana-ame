// ==UserScript==
// @name         ex下拉式阅读
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://exhentai.org/s/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=exhentai.org
// @grant        none
// ==/UserScript==
imgID = 1;

(async function() {
    'use strict';
    
    /* Your code here... */
    function heightToTop(ele){
        /* ele为指定跳转到该位置的DOM节点 */
        let root = document.body;
        let height = 0;
        do{
            height += ele.offsetTop;
            ele = ele.offsetParent;
        }while( ele !== root )
        return height;
    }
    document.onkeydown = function(k){
        console.log(k);
        switch(k.keyCode){
            case KeyEvent.DOM_VK_RIGHT:
            case KeyEvent.DOM_VK_D:
            case KeyEvent.DOM_VK_NUMPAD6:
                imgID = imgID+1;
                var e = document.getElementById(`img${imgID}`);
                window.scrollTo({
                    top:heightToTop(e.target),
                    behavior:'smooth'
                })
                break;
            case KeyEvent.DOM_VK_LEFT:
            case KeyEvent.DOM_VK_A:
            case KeyEvent.DOM_VK_NUMPAD4:
                imgID = imgID-1;
                var e = document.getElementById(`img${imgID}`);
                window.scrollTo({
                    top:heightToTop(e.target),
                    behavior:'smooth'
                })
                break;
        }
    }


    var picsNext = document.createElement('div');
    /* div.textContent = "123"; */

    var lastPrev = location.href;
    var lastNext = location.href;
    var genImgID = 1;

    const element = document.getElementById('i1');
    element.appendChild(picsNext);

    var hrefNext = document.getElementById('next').href;
    while ( hrefNext != lastNext ) {
        /* 啊怎么解析文本形式的html。。 */
        var doc = await fetch(hrefNext)
            .then( resp => resp.text() )
            .then( data => {
                console.log(data);
                var parser = new DOMParser();
                var doc = parser.parseFromString(data, "text/html");
                return doc;
            })
        console.log( doc );
        
        let img = document.createElement('img');
        let element = doc.getElementById('img');
        img.src = element.src;
        genImgID = genImgID + 1;
        img.id = `img${genImgID}`;

        picsNext.appendChild(img);

        lastNext = hrefNext;
        hrefNext = doc.getElementById('next').href;
    }

})();


/*****************************/


fetch('https://exhentai.org/s/d6dfce6b7a/2282686-24')
    .then(response => response.text())
    .then( data => {
        console.log(data);

        // https://stackoverflow.com/questions/9598791/create-a-dom-document-from-string-without-jquery
        var parser = new DOMParser();
        var doc = parser.parseFromString("data", "text/html");
        
        if ( doc.getElementById('next').href != f){

        };

    })