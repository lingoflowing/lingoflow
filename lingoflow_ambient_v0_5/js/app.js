import { state, currentCard, nextCard } from "./state.js";
import { renderCard, renderButton, showError } from "./render.js";
import { playAudio, stopAudio } from "./audio.js";
import { clearTimer } from "./timer.js";
import { wait } from "./timer.js";

const playButton = document.getElementById("playButton");

async function loadCards() {
  const res = await fetch("./data.json?v=0.5", { cache: "no-store" });
  if (!res.ok) throw new Error("data.json 読み込み失敗");
  state.cards = await res.json();
  renderCard();
}

function stop() {
  state.isPlaying = false;
  state.runId += 1;
  clearTimer();
  stopAudio();
  renderButton();
}

async function start() {
  if (!state.cards.length) return;
  state.userStarted = true;
  state.isPlaying = true;
  state.runId += 1;
  renderButton();

  const runId = state.runId;

  while (state.isPlaying && state.runId === runId) {
    const card = currentCard();
    renderCard({ fade: true });

    await wait(800, runId);
    if (!state.isPlaying || state.runId !== runId) break;

    await playAudio(card.audio_word);
    if (!state.isPlaying || state.runId !== runId) break;

    await wait(1000, runId);
    if (!state.isPlaying || state.runId !== runId) break;

    await playAudio(card.audio_sentence);
    if (!state.isPlaying || state.runId !== runId) break;

    await wait(3200, runId);
    if (!state.isPlaying || state.runId !== runId) break;

    nextCard();
  }
}

playButton.addEventListener("click", () => {
  if (state.isPlaying) {
    stop();
  } else {
    start();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});

window.addEventListener("pagehide", stop);
window.addEventListener("blur", stop);

loadCards().catch(() => {
  showError("静かに読み込めませんでした");
});
