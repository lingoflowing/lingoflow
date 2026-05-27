import { state } from "./state.js";

export function clearTimer() {
  if (state.timerId) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

export function wait(ms, runId) {
  clearTimer();

  return new Promise((resolve) => {
    state.timerId = window.setTimeout(() => {
      state.timerId = null;
      if (state.isPlaying && state.runId === runId) resolve();
    }, ms);
  });
}
