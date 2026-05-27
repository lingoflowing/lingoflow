import { state, resetRuntime } from "./state.js";
import { renderCard, setPlayingUi, setStatus } from "./render.js";
import { startLoop, stopLoop } from "./player.js";

async function loadCards() {
  const response = await fetch("./data.json", { cache: "no-store" });
  if (!response.ok) throw new Error("data.json load failed");
  return await response.json();
}

function hardStop(reason = "停止中") {
  state.mode = "STOPPED";
  resetRuntime();
  stopLoop();
  setPlayingUi(false);
  setStatus(reason);
}

async function init() {
  try {
    state.cards = await loadCards();
  } catch (error) {
    console.warn(error);
    state.cards = [];
    setStatus("data error");
    return;
  }

  if (!state.cards.length) {
    setStatus("no data");
    return;
  }

  renderCard(state.cards[state.currentIndex]);

  const button = document.getElementById("playButton");

  button.addEventListener("click", async () => {
    if (state.mode === "PLAYING") {
      hardStop("停止中");
      return;
    }

    state.userStarted = true;
    state.mode = "PLAYING";
    setPlayingUi(true);
    setStatus("再生中");
    startLoop();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hardStop("安全停止");
    }
  });

  window.addEventListener("pagehide", () => {
    hardStop("安全停止");
  });

  window.addEventListener("blur", () => {
    // sleep / app switch safety: never auto-resume
    if (state.mode === "PLAYING") hardStop("安全停止");
  });
}

init();
