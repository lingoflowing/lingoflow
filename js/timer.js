import { state } from "./state.js";

export function wait(ms) {
  return new Promise(resolve => {
    clearTimer();
    state.timerId = setTimeout(() => {
      state.timerId = null;
      resolve();
    }, ms);
  });
}

export function clearTimer() {
  if (state.timerId) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}
