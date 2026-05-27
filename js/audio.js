import { state } from "./state.js";

export function stopSpeech() {
  try {
    window.speechSynthesis.cancel();
  } catch (_) {}
  state.speechToken += 1;
}

export function speak(text) {
  return new Promise(resolve => {
    if (!("speechSynthesis" in window) || !text) {
      resolve();
      return;
    }

    const token = state.speechToken;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.rate = 0.86;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      resolve();
    }

    const guard = setInterval(() => {
      if (state.speechToken !== token || state.mode !== "PLAYING") {
        clearInterval(guard);
        try { window.speechSynthesis.cancel(); } catch (_) {}
        resolve();
      }
    }, 120);
  });
}
