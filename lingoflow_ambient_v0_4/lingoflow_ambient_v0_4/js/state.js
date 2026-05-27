export const Status = Object.freeze({
  STOPPED: 'STOPPED',
  PLAYING: 'PLAYING',
});

export const state = {
  status: Status.STOPPED,
  userStarted: false,
  currentIndex: 0,
  cards: [],
  timerId: null,
  runId: 0,
};

export function isPlaying() {
  return state.status === Status.PLAYING;
}

export function setPlaying() {
  state.status = Status.PLAYING;
  state.userStarted = true;
}

export function setStopped() {
  state.status = Status.STOPPED;
  state.runId += 1;
}

export function nextIndex() {
  if (!state.cards.length) return 0;
  state.currentIndex = (state.currentIndex + 1) % state.cards.length;
  return state.currentIndex;
}
