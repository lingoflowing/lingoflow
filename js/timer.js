import { state, addTimer, clearAllTimers } from './state.js';

export function waitControlled(ms) {
  return new Promise(resolve => {
    const id = setTimeout(() => {
      state.timers.delete(id);
      resolve();
    }, ms);
    addTimer(id);
  });
}

export function stopTimers() {
  clearAllTimers();
}
