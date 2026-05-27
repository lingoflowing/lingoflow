import { state } from "./state.js";
import { renderCard, renderButton } from "./render.js";
import { toggle, safetyStop } from "./player.js";

async function loadCards() {
  const response = await fetch("./data.json?v=0.6", { cache: "no-store" });
  if (!response.ok) throw new Error("data.json load failed");
  state.cards = await response.json();
}

async function init() {
  try {
    await loadCards();
    renderCard();
    renderButton();
  } catch (error) {
    console.error(error);
    document.getElementById("wordZh").textContent = "LingoFlow";
    document.getElementById("wordPinyin").textContent = "";
    document.getElementById("wordJa").textContent = "データを読み込めませんでした。";
    document.getElementById("sentenceZh").textContent = "";
    document.getElementById("sentencePinyin").textContent = "";
    document.getElementById("sentenceJa").textContent = "";
  }

  document.getElementById("playButton").addEventListener("click", toggle);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) safetyStop();
  });

  window.addEventListener("pagehide", safetyStop);
  window.addEventListener("blur", safetyStop);

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      state.voicesReady = true;
    };
  }
}

init();
