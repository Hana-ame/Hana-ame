import './style.css';
import { bindRoleButtons, parseRoute, navigate, showScreen } from './ui/screens.js';

let current = { role: null, cleanup: null };

async function startPc() {
  const { initPc } = await import('./ui/pc.js');
  stopFlow();
  current.role = 'pc';
  current.cleanup = initPc();
}

async function startMobile() {
  const { initMobile } = await import('./ui/mobile.js');
  stopFlow();
  current.role = 'mobile';
  current.cleanup = initMobile(parseRoute().params);
}

function stopFlow() {
  if (current.cleanup) {
    try { current.cleanup(); } catch (e) { console.error(e); }
  }
  current.cleanup = null;
}

bindRoleButtons({ onPc() {}, onMobile() {} });
window.addEventListener('hashchange', route);
route();

function route() {
  const { path } = parseRoute();
  if (path === 'pc') startPc();
  else if (path === 'mobile') startMobile();
  else {
    stopFlow();
    current.role = null;
    showScreen('screen-role');
  }
}
