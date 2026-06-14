export const state = {
  cards: [],
  allCards: [],
  images: [],
  playlists: [],
  chapters: [],
  activeChapter: null,
  activePlaylist: null,
  weeklyInfo: null,
  currentIndex: 0,
  isPlaying: false,
  timerId: null,
  runId: 0
};

export function getCurrentCard(){
  if(!state.cards.length) return null;
  return state.cards[state.currentIndex % state.cards.length];
}

export function nextCard(){
  if(!state.cards.length) return;
  state.currentIndex = (state.currentIndex + 1) % state.cards.length;
}
