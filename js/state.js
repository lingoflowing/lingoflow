export const state = {
  mode: "STOPPED",
  userStarted: false,
  currentIndex: 0,
  cards: [],
  timerId: null,
  speechToken: 0,
  isTransitioning: false
};

export function resetRuntime() {
  if (state.timerId) {
    clearTimeout(state.timerId);
    state.timerId = null;
  }
  state.speechToken += 1;
  state.isTransitioning = false;
}
