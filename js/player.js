import { state, resetRuntime } from "./state.js";
import { fadeToCard } from "./render.js";
import { speak, stopSpeech } from "./audio.js";
import { wait, clearTimer } from "./timer.js";

const TIMING = {
  beforeWord: 800,
  afterWord: 1000,
  afterSentence: 3200
};

let loopRunning = false;

export function stopLoop() {
  loopRunning = false;
  clearTimer();
  stopSpeech();
}

export async function startLoop() {
  if (loopRunning) return;
  loopRunning = true;
  resetRuntime();

  while (state.mode === "PLAYING" && state.cards.length) {
    const card = state.cards[state.currentIndex];

    await waitIfPlaying(TIMING.beforeWord);
    if (!isPlaying()) break;

    await speak(card.zh);
    if (!isPlaying()) break;

    await waitIfPlaying(TIMING.afterWord);
    if (!isPlaying()) break;

    await speak(card.sentence_zh);
    if (!isPlaying()) break;

    await waitIfPlaying(TIMING.afterSentence);
    if (!isPlaying()) break;

    state.currentIndex = (state.currentIndex + 1) % state.cards.length;
    await fadeToCard(state.cards[state.currentIndex]);
  }

  stopLoop();
}

function isPlaying() {
  return state.mode === "PLAYING";
}

async function waitIfPlaying(ms) {
  await wait(ms);
}
