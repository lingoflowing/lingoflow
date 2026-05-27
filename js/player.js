import { state, setStatus, isPlaying, wait, clearTimer } from "./state.js";
import { renderCard, renderButton } from "./render.js";
import { speak, stopAudio } from "./audio.js";

const TIMING = {
  beforeWord: 800,
  afterWord: 1000,
  afterSentence: 3000,
};

let playToken = 0;

export function stop() {
  playToken += 1;
  setStatus("STOPPED");
  clearTimer();
  stopAudio();
  renderButton();
}

export async function play() {
  if (isPlaying()) return;

  state.userStarted = true;
  setStatus("PLAYING");
  renderButton();

  const token = ++playToken;

  while (isPlaying() && token === playToken) {
    const card = state.cards[state.currentIndex];
    renderCard();

    await wait(TIMING.beforeWord);
    if (!isPlaying() || token !== playToken) break;

    await speak(card.zh);
    if (!isPlaying() || token !== playToken) break;

    await wait(TIMING.afterWord);
    if (!isPlaying() || token !== playToken) break;

    await speak(card.sentence_zh);
    if (!isPlaying() || token !== playToken) break;

    await wait(TIMING.afterSentence);
    if (!isPlaying() || token !== playToken) break;

    state.currentIndex = (state.currentIndex + 1) % state.cards.length;
    renderCard({ fade: true });
    await wait(260);
  }
}

export function toggle() {
  if (isPlaying()) {
    stop();
  } else {
    play();
  }
}

export function safetyStop() {
  if (isPlaying()) stop();
}
