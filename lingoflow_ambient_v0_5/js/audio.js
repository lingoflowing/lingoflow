import { state } from "./state.js";

export function stopAudio() {
  if (state.activeAudio) {
    try {
      state.activeAudio.pause();
      state.activeAudio.currentTime = 0;
    } catch (_) {}
  }
  state.activeAudio = null;
}

export function playAudio(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    stopAudio();

    const audio = new Audio(src);
    state.activeAudio = audio;

    const finish = () => {
      if (state.activeAudio === audio) state.activeAudio = null;
      resolve();
    };

    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });

    audio.play().catch(finish);
  });
}
