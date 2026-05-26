import { state, setCards, getCurrentCard, goNextCard } from './state.js';
import { renderCard, setPlayingUI, bindPlayButton, setStatus, fadeCard } from './render.js';
import { startBgm, stopAllAudio, playCardAudio } from './audio.js';
import { waitControlled, stopTimers } from './timer.js';

const TIMING = {
  afterRender: 800,
  afterSentence: 3200,
};

async function init() {
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    const cards = await res.json();
    setCards(cards);
    renderCard(getCurrentCard());
    setPlayingUI(false);
    bindPlayButton(togglePlay);
    attachSafetyEvents();
  } catch (error) {
    console.error(error);
    setStatus('読み込みに失敗しました');
  }
}

function togglePlay() {
  if (state.isPlaying) {
    stop();
  } else {
    start();
  }
}

function start() {
  if (state.isPlaying) return;
  state.userStarted = true;
  state.isPlaying = true;
  setPlayingUI(true);
  startBgm();
  runLoop();
}

function stop() {
  state.isPlaying = false;
  stopTimers();
  stopAllAudio();
  setPlayingUI(false);
}

async function runLoop() {
  while (state.isPlaying) {
    const card = getCurrentCard();
    renderCard(card);
    await waitControlled(TIMING.afterRender);
    if (!state.isPlaying) break;

    await playCardAudio(card);
    if (!state.isPlaying) break;

    await waitControlled(TIMING.afterSentence);
    if (!state.isPlaying) break;

    await fadeCard(() => {
      goNextCard();
      renderCard(getCurrentCard());
    });
  }
}

function attachSafetyEvents() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  window.addEventListener('pagehide', stop);
  window.addEventListener('blur', () => {
    // PC操作中の誤停止を避けるため、blurでは止めない。
    // iOSのタブ離脱・ページ破棄は visibilitychange/pagehide で止める。
  });
}

init();
