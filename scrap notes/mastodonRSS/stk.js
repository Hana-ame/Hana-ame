// ==UserScript==
// @name         毛象
// @version      1.0.0
// @description  展开毛象的喜欢列表
// @match        *://wxw.moe/*
// @match        *://wxw.ooo/*
// @match        *://www.wxw.moe/*
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
  // utils
  function currentDateTime() {
    const currentdate = new Date();
    const datetime =
      currentdate.getFullYear() + "/"
      + (currentdate.getMonth() + 1) + "/"
      + currentdate.getDate() + " @ "
      + currentdate.getHours().toString().padStart(2, '0') + ":"
      + currentdate.getMinutes().toString().padStart(2, '0') + ":"
      + currentdate.getSeconds().toString().padStart(2, '0')
    return datetime
  }

  function removeLikes() {
    let element = document.getElementById('like-extend');
    // console.log(element)
    while (element != null) {
      element.remove(); // Removes the div with the 'div-02' id
      element = document.getElementById('like-extend');
    }
  }

  // /api/vi/statues/[id]/favourated_by
  function appendLikes(data) {
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

  function getIdFromHref(url) {
    let re = /.*\/\/([\w\.]+)\/web\/([\@\w\-\.]+)\/([0-9]+)$/g; // https://(domian)/web/[@username]/[id]
    let arr = re.exec(url);
    if (arr == null) {
      let re = /.*\/\/([\w\.]+)\/([\@\w\-\.]+)\/([0-9]+)$/g; // https://(domian)/web/(@username)/(id)
      arr = re.exec(url);
    }
    if (arr == null) {
      return ["", "", ""]
    }
    return [arr[1], arr[2], arr[3]]
  }

  var app = null;
  function click() {
    let href = document.location.href;
    let [host, username, id] = getIdFromHref(href);
    console.log(host, username, id)
    new Watcher(id);
  }

  // 要用到的元素，每次点击调用click函数
  const button = document.createElement('button');
  button.innerHTML = '+';
  button.addEventListener("click", click, false);
  const div = document.createElement('div');
  div.appendChild(button);


  // 反正callback是这个，从这里改就行了
  function handler(href) {
    let xpath = '//div[@class="focusable detailed-status__wrapper"]/div[@class="detailed-status__action-bar"]';
    let iter = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    let node = iter.iterateNext();
    // console.log(node);
    if (node)
      node.appendChild(div);
  }
  // 下面的可以不用改

  // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
  var oldHref = document.location.href;
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
  setTimeout(function () { handler(document.location.href); }, 5 * 1000);  //5秒后将会调用执行remind()函数
  if (document.location.host == 'wxw.moe') {
    let laststatus = -1
    function fetchAndPrint(){
      fetch("/api/v1/accounts/107281745043054138/statuses?exclude_replies=false")
      .then( r => r.json() )
      .then( r => {
        // for(let i=0; i<c; i++){
          // console.log(r[0])
          console.log(r)
        // }
      })
    }

    function HaruUrara(){
      fetch("/api/v1/accounts/107281745043054138")
      .then(r => r.json())
      .then(r => {
        const currentdate = new Date();
        const datetime = 
            currentdate.getFullYear() + "/"
          + (currentdate.getMonth() + 1) + "/"
          + currentdate.getDate()  + " @ "
          + currentdate.getHours().toString().padStart(2, '0') + ":"
          + currentdate.getMinutes().toString().padStart(2, '0') + ":"
          + currentdate.getSeconds().toString().padStart(2, '0')
        console.log(r.statuses_count, datetime);
        if (r.statuses_count != laststatus) {
          if (laststatus > 0) {
            new Notification(`${r.statuses_count}   ${datetime}`);
            // let c = r.statuses_count-laststatus;
            fetchAndPrint()
          }
        }    
        laststatus = r.statuses_count
      })
    }
    fetchAndPrint()
    setInterval(HaruUrara, 20*1000);
  }

  let script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.src = "https://cdn.jsdelivr.net/npm/vue@next";
  document.body.appendChild(script);

  class Watcher {
    // need this?
    favsUrl = ""
    noteUrl = ""
    id = -1
    favouritesCount = 0

    constructor(id) {
      this.favsUrl = `/api/v1/statuses/${id}/favourited_by`
      this.noteUrl = `/api/v1/statuses/${id}`
      this.favouritesCount = 0
      this.id = setInterval(() => this.logger(), 1000*3*60)
    }
    logger() {
      fetch(this.noteUrl).then(r => r.json()).then(note => {
        if (this.favouritesCount == note.favourites_count) return;
        this.favouritesCount = note.favourites_count
        fetch(this.favsUrl).then(r => r.json()).then(favs => {
          if (note.favourites_count > favs.length) {
            console.log(note.id, note.favourites_count, favs.length, currentDateTime());
            clearInterval(this.id);
          }
        })
      })
    }

  }


  setTimeout(() => {
    const el = document.createElement('div');
    el.setAttribute('id', 'app');
    const styles = [
      'position: fixed;',
      'bottom: 0;',
      'left: 0;',
      'width: 240px;',
      'height: auto;',
      'background-color: rgba(1,1,1,0.25);',
    ]
    el.setAttribute('style', styles.join(" "))
    el.innerHTML = `
      <div>
        {{ favourites_count }} - {{ favourites.length }}
      </div>
      <div v-show="show">
        <span v-for="data in favourites" key="data.id">
          <a :href="data.url">
            <img
              :src="data.avatar"
              width="48"
              height="48"
              :alt="data.acct"
              :title="data.display_name"
            >
          </a>
        </span>
      </div>
      <!--
      <button @click="click">{{ message }}</button>
      -->
      <button @click="click">+</button>
      <button @click="add">+</button>
      `
    document.body.append(el)
    const App = {
      data() {
        return {
          message: "Hello Element Plus",
          datas: [],
          oldHref: "",
          favourites_count: 0,
          favourites: [],
          show: true,
        };
      },
      methods: {
        click() {
          console.log("clicked in vue");
          this.show = !this.show;
        },
        add() {
          const [host, username, id] = getIdFromHref(document.location.href)
          if (id == "") return;
          new Watcher(id)
        },
        getNote(id) {
          const url = `/api/v1/statuses/${id}`
          fetch(url).then(r => r.json()).then(r => {
            // console.log("note", r);
            this.favourites_count = r.favourites_count;
          })
        },
        getFavs(id) {
          const url = `/api/v1/statuses/${id}/favourited_by`
          fetch(url).then(r => r.json()).then(r => {
            // console.log("favs", r);
            this.favourites = r ?? [];
          })
        },
        handler(href) {
          // console.log(href)
          const [host, username, id] = getIdFromHref(href)
          if (id == "") return;
          this.getFavs(id)
          this.getNote(id)
        }
      },
      mounted() {
        console.log("onMounted")
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (this.oldHref != document.location.href) {
              this.oldHref = document.location.href;
              /* Changed ! your code here */
              this.handler(document.location.href);
            }
          });
        });
        const config = {
          childList: true,
          subtree: true
        };
        observer.observe(bodyList, config);
      }
    };
    app = Vue.createApp(App);
    app.mount("#app");
  }, 1000 * 5);

})();

/*
  ~~though can finish it in some way, but i should not to continue this.~~
  Although I can finish it in some way, I should not continue this.
*/