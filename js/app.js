import { state, getCurrentCard, nextCard } from './state.js';
import { renderCurrentCard, rerenderForViewport, showError } from './render.js';
import { clearTimer } from './timer.js';
import { speak, stopPlayback, stopAllAudio } from './audio.js';
import { PLAY_SVG, STOP_SVG } from './icons.js';
import { track } from './analytics.js';

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
    track('card_view', { index: state.currentIndex, id: card.id || null });

    // 重要：
    // 画像切替後の待機時間を削除。
    // ここで待つとBGMだけが前に出る。
    for(const text of textSequence(card)){
      if(!state.isPlaying || runId !== state.runId) break;

      await speak(text, runId);

      if(!state.isPlaying || runId !== state.runId) break;

      // 単語→例文の待機も入れない。
      // 中国語音声の空白時間を最小化する。
    }

    if(!state.isPlaying || runId !== state.runId) break;

    track('card_complete', { index: state.currentIndex, id: card.id || null });

    // カード終了後の1800ms待機も削除。
    // すぐ次カードへ進める。
    nextCard();
  }
}

function startPlayback(){
  if(state.isPlaying || !state.cards.length) return;

  track('play_start', { index: state.currentIndex });
  state.isPlaying = true;
  state.runId++;
  updateButton();
  playLoop(state.runId);
}

function stopAndRender(){
  if(state.isPlaying) track('play_stop', { index: state.currentIndex });
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
  track('app_loaded', { cardCount: cards.length });
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