// ==UserScript==
// @name         毛象
// @version      0.2
// @description  展开毛象的喜欢列表
// @match        *://wxw.moe/*
// @match        *://retirenow.top/*
// @match        *://monado.ren/*
// @match        *://mona.do/*
// @match        *://o3o.ca/*
// @match        *://bgme.me/*
// @match        *://m.cmx.im/*
// @icon         https://wxw.moe/favicon.ico
// @grant        none
// @homepageURL  https://github.com/Hana-ame/hana-ame/blob/main/scrap%20notes/javascript/mastodon-likes.js
// ==/UserScript==

(function() {
    'use strict';
  
    // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
    var oldHref = document.location.href;
  
    // function deleteLikeExtend(){
    //   let xpath = '//div[@class="focusable detailed-status__wrapper"]';
    //   let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null );
    //   let node = iter.iterateNext();
    //   console.log(node);
    // }
  
    async function extendLikes(url){
  
        // deleteLikeExtend()
        let element = document.getElementById('like-extend');
        // console.log(element)
        while (element != null){
            element.remove(); // Removes the div with the 'div-02' id
            element = document.getElementById('like-extend');
        }
  
        // window.location.hostname
        let re = /.*\/\/([\w\.]+)\/web\/([\@\w\-\.]+)\/([0-9]+)$/g;
        let arr = re.exec(url);
  
        // 抓包
        if (arr == null) {
          let re = /.*\/\/([\w\.]+)\/web\/([\@\w\-\.]+)\/([0-9]+)\/favourites$/g;
          let arr = re.exec(url);
  
          if (arr == null) return;
  
          let favourateUrl = "https://" + arr[1] + "/api/v1/statuses/" + arr[3] + "/favourited_by";
  
          let id = setInterval( () => {
              fetch(favourateUrl)
              .then( r => r.json() )
              .then( r => {
                  var currentdate = new Date();
                  var datetime = "Found HaruUrara: " + currentdate.getDate() + "/"
                          + (currentdate.getMonth()+1)  + "/"
                          + currentdate.getFullYear() + " @ "
                          + currentdate.getHours() + ":"
                          + currentdate.getMinutes() + ":"
                          + currentdate.getSeconds();
                  /* console.log(datetime + " @ " + url); */
  
                  for (const i of r) {
                      if (i.username === 'HaruUrara') {
                          console.log(r);
                          console.log(datetime + " @ " + url);
                          clearInterval(id);
                      }
                  }
              })
          }, 1000*90 );
            console.log(favourateUrl + "#" + id);
          return;
        };
  
        // console.log(arr);
        console.log(arr[1]);
        console.log(arr[2]);
        console.log(arr[3]);
  
        let favourateUrl = "https://" + arr[1] + "/api/v1/statuses/" + arr[3] + "/favourited_by";
  
        fetch(favourateUrl)
            .then(response => response.json())
            .then(data => {
  
            console.log(data);
            let div = document.createElement('div');
            for (const item of data){
                let img = document.createElement('img');
                img.src = item['avatar'];
                img.width = 48;
                img.height = 48;
                img.alt = item['acct'];
                img.title = item['acct'] + '\n' + item['display_name'];
                div.appendChild(img);
            }
            div.id = 'like-extend'
            console.log( div );
            // thisNode.appendChild(div);
            // return div;
            let xpath = '//div[@class="focusable detailed-status__wrapper"]';
            let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null );
            let node = iter.iterateNext();
            console.log(node);
  
            node.appendChild(div);
  
        });
  
  
    }
  
    // window.onload = function() {
    //(function() {
        var bodyList = document.querySelector("body")
  
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (oldHref != document.location.href) {
                    oldHref = document.location.href;
                    /* Changed ! your code here */
                    extendLikes(document.location.href);
                }
            });
        });
  
        var config = {
            childList: true,
            subtree: true
        };
  
        observer.observe(bodyList, config);
    //})();
    setTimeout(function() { extendLikes(document.location.href); }, 1000);  //5秒后将会调用执行remind()函数
  
  })();