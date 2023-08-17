// ==UserScript==
// @name         毛象
// @version      0.3.0
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

(function () {
  'use strict';

  function getDateTime(){
    const currentdate = new Date();
    const datetime = 
        currentdate.getFullYear() + "/"
      + (currentdate.getMonth() + 1) + "/"
      + currentdate.getDate()  + " @ "
      + currentdate.getHours().toString().padStart(2, '0') + ":"
      + currentdate.getMinutes().toString().padStart(2, '0') + ":"
      + currentdate.getSeconds().toString().padStart(2, '0')
    return datetime
  }

  function removeLikes(){
    let element = document.getElementById('like-extend');
    // console.log(element)
    while (element != null) {
      element.remove(); // Removes the div with the 'div-02' id
      element = document.getElementById('like-extend');
    }
  }

  function appendLikes(data){

    let div = document.createElement('div');
    for (const item of data) {
      let a = document.createElement('a');
      a.href = item.url;
      let img = document.createElement('img');
      img.src = item['avatar'];
      img.width = 48;
      img.height = 48;
      img.alt = item['acct'];
      img.title = item['acct'] + '\n' + item['display_name'];
      a.appendChild(img)
      div.appendChild(a);
    }
    div.id = 'like-extend'
    console.log(div);
    // thisNode.appendChild(div);
    // return div;
    let xpath = '//div[@class="focusable detailed-status__wrapper"]';
    let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    let node = iter.iterateNext();
    console.log(node);
    node.appendChild(div);
  }

  class Monitor {
    constructor(id) {
      this.id = id;
      this.count = 0;
      this.status = `/api/v1/statuses/${id}`;
      this.favourtate_by = `/api/v1/statuses/${id}/favourited_by`;
    }
    
    fetchFavs(){
      return fetch(this.favourtate_by)
      .then(r => r.json())
      .then(d => {
        appendLikes(d);
        return d.length;
      })
    }
    fetchStatus(){
      return fetch(this.status)
      .then(r => r.json())
      .then(d => {
        return d.favourites_count;
      })
    }
    async run(){
      console.log("run @", getDateTime());
      const flag = await this.check();
      if (flag) return;
      this.flag = setInterval(() => this.check(), 1000*40);
    }
    async check(){
      const length = await this.fetchStatus()
      if (length == this.count) return
      this.count = length
      const count = await this.fetchFavs()
      if (count < length) {
        console.log(this.id, getDateTime(), count, length);
        clearInterval(this.flag);
        return true;
      }
      return false;
    }
  }

  function getIdFromHref(url){
    let re = /.*\/\/([\w\.]+)\/web\/([\@\w\-\.]+)\/([0-9]+)$/g;
    let arr = re.exec(url);
    if (arr == null) {
      let re = /.*\/\/([\w\.]+)\/([\@\w\-\.]+)\/([0-9]+)$/g;
      arr = re.exec(url);
    }
    if (arr == null) {
      return "";
    }
    return arr[3];  
  }

  function handler(href){
    removeLikes();
    const id = getIdFromHref(href);
    if (id === "") return;
    console.log(href, id);
    const m = new Monitor(id);
    m.run()
  }


  // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
  var oldHref = document.location.href;
  // window.onload = function() {
  //(function() {
  var bodyList = document.querySelector("body")

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        /* Changed ! your code here */
        handler(document.location.href);
      }
    });
  });
  var config = {
    childList: true,
    subtree: true
  };
  observer.observe(bodyList, config);
  //})();
  setTimeout(function () { handler(document.location.href); }, 1000);  //5秒后将会调用执行remind()函数

})();
