import { state } from './state.js';

export function clearTimer() {
  if (state.timerId !== null) {
    window.clearTimeout(state.timerId);
    state.timerId = null;
  }
}

export function wait(ms, runId) {
  clearTimer();
  return new Promise(resolve => {
    state.timerId = window.setTimeout(() => {
      state.timerId = null;
      if (state.runId === runId) resolve(true);
      else resolve(false);
    }, ms);
  });
}
