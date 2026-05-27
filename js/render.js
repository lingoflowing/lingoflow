import { state } from "./state.js";

const els = {
  card: document.getElementById("card"),
  scene: document.getElementById("scene"),
  sceneIcon: document.getElementById("sceneIcon"),
  wordZh: document.getElementById("wordZh"),
  wordPinyin: document.getElementById("wordPinyin"),
  wordJa: document.getElementById("wordJa"),
  sentenceZh: document.getElementById("sentenceZh"),
  sentencePinyin: document.getElementById("sentencePinyin"),
  sentenceJa: document.getElementById("sentenceJa"),
  playButton: document.getElementById("playButton"),
  status: document.getElementById("status")
};

export function renderCard(card) {
  if (!card) return;
  els.scene.dataset.scene = card.scene_type || "default";
  els.sceneIcon.textContent = card.scene || "";
  els.wordZh.textContent = card.zh;
  els.wordPinyin.textContent = card.pinyin;
  els.wordJa.textContent = card.ja;
  els.sentenceZh.textContent = card.sentence_zh;
  els.sentencePinyin.textContent = card.sentence_pinyin;
  els.sentenceJa.textContent = card.sentence_ja;
}

export async function fadeToCard(card) {
  if (!card || state.isTransitioning) return;
  state.isTransitioning = true;
  els.card.classList.add("is-fading");
  await wait(560);
  renderCard(card);
  await wait(90);
  els.card.classList.remove("is-fading");
  await wait(360);
  state.isTransitioning = false;
}

export function setPlayingUi(isPlaying) {
  els.playButton.textContent = isPlaying ? "■" : "▶";
  els.playButton.setAttribute("aria-label", isPlaying ? "停止" : "再生");
}

export function setStatus(text) {
  els.status.textContent = text;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
