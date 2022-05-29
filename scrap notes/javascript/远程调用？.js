javascript: (function() {
  function panda_init(c) {
    if (c >= 3) {
      return;
    };
    let n = ['https://ex.acg.uy/'];
    let t = setTimeout(function() {
      clearTimeout(t);
      panda_init(c + 1);
    },
    3000);
    let s = document.createElement('script');
    s.src = (n[c] ? n[c] : n[0]) + 'panda.js?' + parseInt(Date.parse(new Date()) / 600000) + c;
    s.onerror = function() {
      clearTimeout(t);
      panda_init(c + 1);
    };
    s.onload = function() {
      clearTimeout(t);
    };
    document.body.appendChild(s);
  };
  panda_init(0);
} ());

// 需要content-type 为 js 的，
// pages 也没用
SCRIPT_URL = `https://moonchan.xyz/clear-display-name.js`;
SCRIPT_URL = `https://gh.azalea.workers.dev/Hana-ame/hana-ame/main/scrap%20notes/javascript/clear_display_name.js`
let s = document.createElement('script');
s.src = SCRIPT_URL;
document.body.appendChild(s);


