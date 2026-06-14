import { state } from './state.js';

export function clearTimer(){
  if(state.timerId){
    clearTimeout(state.timerId);
    state.timerId = null;
  }
}

export function wait(ms, runId){
  return new Promise(resolve => {
    clearTimer();
    state.timerId = setTimeout(() => {
      state.timerId = null;
      resolve();
    }, ms);
  });
}
