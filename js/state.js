export const state = {
  isPlaying: false,
  userStarted: false,
  currentIndex: 0,
  cards: [],
  timerId: null,
  activeAudio: null,
  runId: 0
};

export function currentCard() {
  return state.cards[state.currentIndex];
}

export function nextCard() {
  if (!state.cards.length) return;
  state.currentIndex = (state.currentIndex + 1) % state.cards.length;
}
