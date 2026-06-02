import { state, getCurrentCard, nextCard } from './state.js';
import { renderCurrentCard, rerenderForViewport, showError } from './render.js';
import { wait, clearTimer } from './timer.js';
import { speak, stopPlayback, stopAllAudio } from './audio.js';
import { PLAY_SVG, STOP_SVG } from './icons.js';

const button = document.getElementById('playStopButton');
const icon = document.getElementById('playStopIcon');

function updateButton(){
  button.classList.toggle('is-playing', state.isPlaying);
  icon.innerHTML = state.isPlaying ? STOP_SVG : PLAY_SVG;
  button.setAttribute('aria-label', state.isPlaying ? '停止' : '再生');
}

function textSequence(card){
  return [
    card.wordZh,
    card.sentenceZh
  ].filter(Boolean);
}

async function playLoop(runId){
  while(state.isPlaying && runId === state.runId){
    const card = getCurrentCard();
    if(!card) break;

    renderCurrentCard();

    await wait(900, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    for(const text of textSequence(card)){
      await speak(text, runId);
      if(!state.isPlaying || runId !== state.runId) break;
      await wait(700, runId);
    }

    if(!state.isPlaying || runId !== state.runId) break;

    await wait(1800, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    nextCard();
  }
}

function startPlayback(){
  if(state.isPlaying || !state.cards.length) return;

  state.isPlaying = true;
  state.runId++;
  updateButton();
  playLoop(state.runId);
}

function stopAndRender(){
  stopPlayback();
  updateButton();
}

async function loadCards(){
  const response = await fetch('data.json', { cache: 'no-store' });
  if(!response.ok) throw new Error('data.json load failed');

  const cards = await response.json();
  if(!Array.isArray(cards) || cards.length === 0){
    throw new Error('data.json is empty');
  }

  state.cards = cards;
  state.currentIndex = 0;
  renderCurrentCard();
}

button.addEventListener('click', () => {
  if(state.isPlaying) stopAndRender();
  else startPlayback();
});

document.addEventListener('visibilitychange', () => {
  if(document.hidden) stopAndRender();
});

window.addEventListener('pagehide', () => {
  stopAndRender();
});

window.addEventListener('resize', () => {
  rerenderForViewport();
});

window.addEventListener('load', async () => {
  updateButton();

  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = () => {};
  }

  try{
    await loadCards();
  }catch(error){
    clearTimer();
    stopAllAudio();
    showError('カードデータを読み込めませんでした。data.json を確認してください。');
    console.error(error);
  }
});
