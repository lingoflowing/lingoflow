export const state = {
  isPlaying: false,
  userStarted: false,
  currentIndex: 0,
  cards: [],
  timers: new Set(),
  speechToken: 0,
};

export function setCards(cards) {
  state.cards = Array.isArray(cards) ? cards : [];
}

export function getCurrentCard() {
  return state.cards[state.currentIndex] || null;
}

export function goNextCard() {
  if (!state.cards.length) return null;
  state.currentIndex = (state.currentIndex + 1) % state.cards.length;
  return getCurrentCard();
}

export function addTimer(timerId) {
  state.timers.add(timerId);
  return timerId;
}

export function clearAllTimers() {
  for (const id of state.timers) clearTimeout(id);
  state.timers.clear();
}
