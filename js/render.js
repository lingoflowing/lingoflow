import { state } from "./state.js";

const els = {
  card: document.getElementById("card"),
  sceneArt: document.getElementById("sceneArt"),
  wordZh: document.getElementById("wordZh"),
  wordPinyin: document.getElementById("wordPinyin"),
  wordJa: document.getElementById("wordJa"),
  sentenceZh: document.getElementById("sentenceZh"),
  sentencePinyin: document.getElementById("sentencePinyin"),
  sentenceJa: document.getElementById("sentenceJa"),
  playButton: document.getElementById("playButton"),
};

export function renderCard({ fade = false } = {}) {
  const card = state.cards[state.currentIndex];
  if (!card) return;

  const apply = () => {
    els.sceneArt.className = `scene-art ${card.scene || "scene-coffee"}`;
    els.wordZh.textContent = card.zh;
    els.wordPinyin.textContent = card.pinyin;
    els.wordJa.textContent = card.ja;
    els.sentenceZh.textContent = card.sentence_zh;
    els.sentencePinyin.textContent = card.sentence_pinyin;
    els.sentenceJa.textContent = card.sentence_ja;
  };

  if (!fade) {
    apply();
    return;
  }

  els.card.classList.add("is-fading");
  setTimeout(() => {
    apply();
    els.card.classList.remove("is-fading");
  }, 240);
}

export function renderButton() {
  els.playButton.textContent = state.status === "PLAYING" ? "Ⅱ" : "▶";
  els.playButton.setAttribute("aria-label", state.status === "PLAYING" ? "停止" : "再生");
}
