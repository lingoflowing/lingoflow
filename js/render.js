import { state, currentCard } from "./state.js";

const els = {
  card: document.getElementById("card"),
  visualIcon: document.getElementById("visualIcon"),
  wordZh: document.getElementById("wordZh"),
  wordPinyin: document.getElementById("wordPinyin"),
  wordJa: document.getElementById("wordJa"),
  sentenceZh: document.getElementById("sentenceZh"),
  sentencePinyin: document.getElementById("sentencePinyin"),
  sentenceJa: document.getElementById("sentenceJa"),
  playButton: document.getElementById("playButton")
};

export function renderCard({ fade = false } = {}) {
  const card = currentCard();
  if (!card) return;

  const apply = () => {
    els.visualIcon.textContent = card.icon || "流";
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
  window.setTimeout(() => {
    apply();
    els.card.classList.remove("is-fading");
  }, 150);
}

export function renderButton() {
  els.playButton.textContent = state.isPlaying ? "■" : "▶";
  els.playButton.setAttribute("aria-label", state.isPlaying ? "停止" : "再生");
}

export function showError(message) {
  els.wordZh.textContent = message;
  els.wordPinyin.textContent = "";
  els.wordJa.textContent = "";
  els.sentenceZh.textContent = "";
  els.sentencePinyin.textContent = "";
  els.sentenceJa.textContent = "";
}
