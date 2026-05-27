export const state = {
  isPlaying: false,
  userStarted: false,
  currentIndex: 0,
  cards: [],
  timerId: null,
  runId: 0,
  currentAudio: null,
  voice: null
};

export function currentCard(){
  return state.cards[state.currentIndex];
}

export function nextCard(){
  if(!state.cards.length) return;
  state.currentIndex = (state.currentIndex + 1) % state.cards.length;
}
