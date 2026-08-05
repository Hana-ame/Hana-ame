import { showScreen, navigate, $ } from './screens.js';

export function initMobile(params) {
  showScreen('screen-mobile');
  if (params?.get('room')) {
    $('#mobile-code').value = params.get('room');
  }

  $('#mobile-back').addEventListener('click', () => navigate('/'));

  return () => {
    $('#mobile-back').removeEventListener('click', () => navigate('/'));
  };
}
