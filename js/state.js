export const state = {
  status: "STOPPED",
  currentIndex: 2,
  cards: [],
  timerId: null,
  userStarted: false,
  voicesReady: false,
};

export function isPlaying() {
  return state.status === "PLAYING";
}

export function setStatus(status) {
  state.status = status;
}

export function clearTimer() {
  if (state.timerId) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

export function wait(ms) {
  clearTimer();
  return new Promise((resolve) => {
    state.timerId = setTimeout(() => {
      state.timerId = null;
      resolve();
    }, ms);
  });
}
