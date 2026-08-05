import { showScreen, navigate, $ } from './screens.js';

export function initPc() {
  showScreen('screen-pc');
  $('#pc-status').textContent = '连接层开发中…';
  $('#pc-start').disabled = true;

  $('#pc-back').addEventListener('click', () => navigate('/'));

  return () => {
    $('#pc-back').removeEventListener('click', () => navigate('/'));
  };
}
