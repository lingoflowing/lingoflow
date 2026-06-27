import { state } from './state.js';
import { clearTimer } from './timer.js';

// Phase122 iPhone stable audio patch
// - BGM is intentionally disabled in this recovery patch.
// - The card narration uses one reusable <audio> element.
// - Silent gaps are plain timers, so speechSynthesis cannot steal audio focus.
// - A short silent MP3 is played after each card voice to keep mobile audio flow stable.

const TRAILING_SILENCE_SRC = 'audio/silence/silence_1000ms.mp3';

let silentEndTimer = null;
let cardAudio = null;

function clearSilentTimer(){
  if(silentEndTimer){
    clearTimeout(silentEndTimer);
    silentEndTimer = null;
  }
}

function ensureCardAudio(){
  if(cardAudio) return cardAudio;

  cardAudio = document.getElementById('cardZhAudio');

  if(!cardAudio){
    cardAudio = document.createElement('audio');
    cardAudio.id = 'cardZhAudio';
    cardAudio.preload = 'auto';
    cardAudio.setAttribute('playsinline', '');
    document.body.appendChild(cardAudio);
  }

  cardAudio.volume = 1;
  cardAudio.loop = false;
  return cardAudio;
}

function resetCardAudio(){
  if(!cardAudio) return;

  try {
    cardAudio.pause();
    cardAudio.removeAttribute('src');
    cardAudio.load();
  } catch (error) {
    // Ignore browser-specific media cleanup errors.
  }
}

export function stopAllAudio(){
  clearSilentTimer();
  resetCardAudio();

  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }
}

export function startPlayback(){
  state.isPlaying = true;
  state.runId++;
  clearTimer();
  clearSilentTimer();

  // Unlock the reusable audio element from the user's tap.
  ensureCardAudio();

  return state.runId;
}

export function stopPlayback(){
  state.isPlaying = false;
  state.runId++;
  clearTimer();
  stopAllAudio();
}

function cardNoFromCard(card){
  const raw = card?.cardNo ?? card?.no ?? card?.number;
  const numeric = Number(raw);

  if(Number.isFinite(numeric) && numeric > 0){
    return numeric;
  }

  const id = String(card?.id || card?.cardId || '');
  const match = id.match(/(\d+)/);

  if(match){
    const fromId = Number(match[1]);
    if(Number.isFinite(fromId) && fromId > 0) return fromId;
  }

  return null;
}

export function zhAudioPath(card){
  const no = cardNoFromCard(card);
  if(!no) return '';

  const id = String(no).padStart(3, '0');
  return `audio/zh/Card_${id}_zh.mp3`;
}

function playAudioSrc(src, runId){
  return new Promise(resolve => {
    if(!src || !state.isPlaying || runId !== state.runId){
      resolve();
      return;
    }

    const audio = ensureCardAudio();
    let finished = false;

    const cleanup = () => {
      audio.removeEventListener('ended', onDone);
      audio.removeEventListener('error', onDone);
      audio.removeEventListener('abort', onDone);
    };

    const onDone = () => {
      if(finished) return;
      finished = true;
      cleanup();
      resolve();
    };

    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (error) {
      // Ignore seek errors while changing source.
    }

    audio.addEventListener('ended', onDone);
    audio.addEventListener('error', onDone);
    audio.addEventListener('abort', onDone);

    audio.volume = 1;
    audio.loop = false;
    audio.src = src;
    audio.load();

    const playPromise = audio.play();

    if(playPromise && typeof playPromise.catch === 'function'){
      playPromise.catch(onDone);
    }
  });
}

export async function playCardZhAudio(card, runId){
  if(!card || !state.isPlaying || runId !== state.runId) return;

  const src = zhAudioPath(card);
  if(!src) return;

  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }

  await playAudioSrc(src, runId);

  if(!state.isPlaying || runId !== state.runId) return;

  // Keep the iPhone media pipeline continuous without letting BGM come forward.
  await playAudioSrc(TRAILING_SILENCE_SRC, runId);
}

// Kept for compatibility. The app now uses pre-generated MP3 narration.
export function speak(text, runId){
  return speakSilent(0, runId);
}

export function speakSilent(durationMs = 800, runId){
  return new Promise(resolve => {
    if(!state.isPlaying || runId !== state.runId){
      resolve();
      return;
    }

    const duration = Math.max(0, Number(durationMs) || 0);

    if(duration === 0){
      resolve();
      return;
    }

    clearSilentTimer();

    silentEndTimer = window.setTimeout(() => {
      silentEndTimer = null;
      resolve();
    }, duration);
  });
}
