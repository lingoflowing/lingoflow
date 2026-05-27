import { state, currentCard, nextCard } from './state.js';
import { renderCard } from './render.js';
import { playWord, playSentence, stopAllAudio } from './audio.js';

export function clearTimer(){
  if(state.timerId){
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

export function wait(ms, runId){
  return new Promise(resolve => {
    clearTimer();
    state.timerId = window.setTimeout(() => {
      state.timerId = null;
      if(state.isPlaying && state.runId === runId) resolve();
    }, ms);
  });
}

export async function playLoop(){
  const runId = state.runId;
  while(state.isPlaying && state.runId === runId){
    const card = currentCard();
    renderCard();

    await wait(800, runId);
    if(!state.isPlaying || state.runId !== runId) break;

    await playWord(card);
    if(!state.isPlaying || state.runId !== runId) break;

    await wait(1000, runId);
    if(!state.isPlaying || state.runId !== runId) break;

    await playSentence(card);
    if(!state.isPlaying || state.runId !== runId) break;

    await wait(3000, runId);
    if(!state.isPlaying || state.runId !== runId) break;

    nextCard();
  }
  stopAllAudio();
  clearTimer();
}
