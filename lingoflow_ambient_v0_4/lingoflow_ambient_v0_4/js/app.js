import { state, Status, isPlaying, setPlaying, setStopped, nextIndex } from './state.js';
import { renderCard, renderButton, renderError, fadeToCard, dom } from './render.js';
import { clearTimer, wait } from './timer.js';
import { prepareVoice, speakZh, stopAudio } from './audio.js';

const TIMING = Object.freeze({
  beforeWord: 800,
  afterWord: 1000,
  afterSentence: 3200,
});

async function loadCards() {
  const response = await fetch('./data.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('data.json を読み込めませんでした。');
  const cards = await response.json();
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error('カードデータが空です。');
  }
  return cards;
}

function stop() {
  setStopped();
  clearTimer();
  stopAudio();
  renderButton(false);
}

async function playLoop(runId) {
  while (state.status === Status.PLAYING && state.runId === runId) {
    const card = state.cards[state.currentIndex];
    renderCard(card);

    if (!(await wait(TIMING.beforeWord, runId))) break;
    if (!(await speakZh(card.zh, runId, () => state.runId))) break;

    if (!(await wait(TIMING.afterWord, runId))) break;
    if (!(await speakZh(card.sentence_zh, runId, () => state.runId))) break;

    if (!(await wait(TIMING.afterSentence, runId))) break;

    nextIndex();
    await fadeToCard(state.cards[state.currentIndex]);
  }
}

function start() {
  if (!state.cards.length) return;
  if (isPlaying()) return;

  state.runId += 1;
  const runId = state.runId;
  setPlaying();
  renderButton(true);
  playLoop(runId);
}

function togglePlay() {
  if (isPlaying()) stop();
  else start();
}

function installSafetyGuards() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  window.addEventListener('pagehide', stop);
  window.addEventListener('blur', () => {
    // iPhone sleep / app switch safety: never continue invisible or unfocused playback.
    stop();
  });
}

async function init() {
  try {
    prepareVoice();
    installSafetyGuards();

    state.cards = await loadCards();
    renderCard(state.cards[state.currentIndex]);
    renderButton(false);

    dom.playButton.addEventListener('click', togglePlay);
  } catch (error) {
    renderError(error.message || '静かに読み込みに失敗しました。');
    renderButton(false);
  }
}

init();
