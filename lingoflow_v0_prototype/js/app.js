import { state } from './state.js';
import { renderCard, renderPlayState, renderError } from './render.js';
import { stopAllAudio } from './audio.js';
import { clearTimer, playLoop } from './timer.js';

const playButton = document.getElementById('playButton');

async function loadCards(){
  const res = await fetch('./data.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('data.json を読み込めませんでした');
  const cards = await res.json();
  if(!Array.isArray(cards) || cards.length === 0) throw new Error('カードデータが空です');
  state.cards = cards;
}

function start(){
  if(state.isPlaying) return;
  state.userStarted = true;
  state.isPlaying = true;
  state.runId += 1;
  renderPlayState();
  playLoop();
}

function stop(){
  state.isPlaying = false;
  state.runId += 1;
  clearTimer();
  stopAllAudio();
  renderPlayState();
  renderCard();
}

function toggle(){
  state.isPlaying ? stop() : start();
}

function forceSafeStop(){
  if(state.isPlaying) stop();
  stopAllAudio();
  clearTimer();
}

document.addEventListener('visibilitychange', () => {
  if(document.hidden) forceSafeStop();
});

window.addEventListener('pagehide', forceSafeStop);
window.addEventListener('blur', () => {
  // iOS/Chrome tab switching safety: never keep audio alive in background.
  forceSafeStop();
});

playButton.addEventListener('click', toggle);

loadCards()
  .then(() => {
    renderCard();
    renderPlayState();
  })
  .catch(err => {
    console.error(err);
    renderError('静かに再読み込みしてください。');
    renderPlayState();
  });
