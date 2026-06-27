import { state } from './state.js';
import { clearTimer } from './timer.js';
import { startBgm, stopBgm, markBgmUserStarted, enforceBgmVolume } from './bgm.js';

const BGM_SAFE_VOLUME = 0.01;
const SILENCE_AFTER_CARD_SRC = 'audio/silence/silence_1000ms.mp3';

let silentEndTimer = null;
let sharedCardAudio = null;
let audioSequenceToken = 0;

function forceQuietBgmElements(){
  enforceBgmVolume();

  document.querySelectorAll('audio').forEach(audio => {
    const key = `${audio.id || ''} ${audio.className || ''} ${audio.src || ''}`.toLowerCase();
    if(key.includes('bgm') || key.includes('music')){
      audio.volume = BGM_SAFE_VOLUME;
    }
  });
}

function startBgmQuietly(){
  markBgmUserStarted();
  startBgm();
  forceQuietBgmElements();
}

function clearSilentTimer(){
  if(silentEndTimer){
    clearTimeout(silentEndTimer);
    silentEndTimer = null;
  }
}

function getSharedCardAudio(){
  if(sharedCardAudio) return sharedCardAudio;

  sharedCardAudio = document.getElementById('cardZhAudio');

  if(!sharedCardAudio){
    sharedCardAudio = document.createElement('audio');
    sharedCardAudio.id = 'cardZhAudio';
    sharedCardAudio.preload = 'auto';
    sharedCardAudio.setAttribute('playsinline', '');
    document.body.appendChild(sharedCardAudio);
  }

  sharedCardAudio.volume = 1;
  sharedCardAudio.loop = false;
  return sharedCardAudio;
}

function stopSharedCardAudio(){
  if(!sharedCardAudio) return;

  sharedCardAudio.pause();

  try{
    sharedCardAudio.currentTime = 0;
  }catch(error){
    // Some mobile browsers reject currentTime changes before metadata is loaded.
  }
}

export function stopAllAudio(){
  audioSequenceToken++;
  clearSilentTimer();
  stopSharedCardAudio();

  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }
}

export function startPlayback(){
  state.isPlaying = true;
  state.runId++;
  audioSequenceToken++;
  clearTimer();
  clearSilentTimer();

  // Create the reusable audio element during the user's first tap.
  // iPhone/Safari is more stable when later cards reuse this same element.
  getSharedCardAudio();

  startBgmQuietly();

  return state.runId;
}

export function stopPlayback(){
  state.isPlaying = false;
  state.runId++;
  clearTimer();
  stopAllAudio();
  stopBgm();
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

function playSource(src, runId, sequenceToken){
  return new Promise(resolve => {
    if(!src || !state.isPlaying || runId !== state.runId || sequenceToken !== audioSequenceToken){
      resolve();
      return;
    }

    startBgmQuietly();
    forceQuietBgmElements();

    const audio = getSharedCardAudio();
    stopSharedCardAudio();

    const done = () => {
      audio.removeEventListener('ended', done);
      audio.removeEventListener('error', done);
      forceQuietBgmElements();
      resolve();
    };

    audio.addEventListener('ended', done);
    audio.addEventListener('error', done);

    audio.src = src;
    audio.preload = 'auto';
    audio.volume = 1;
    audio.loop = false;

    try{
      audio.load();
    }catch(error){
      // load() can be unavailable or noisy on some mobile browsers; play() will still try.
    }

    audio.play().then(() => {
      forceQuietBgmElements();
    }).catch(done);
  });
}

export async function playCardZhAudio(card, runId){
  if(!card || !state.isPlaying || runId !== state.runId) return;

  const src = zhAudioPath(card);
  if(!src) return;

  const sequenceToken = audioSequenceToken;

  // 1. Play the actual card MP3.
  await playSource(src, runId, sequenceToken);
  if(!state.isPlaying || runId !== state.runId || sequenceToken !== audioSequenceToken) return;

  // 2. Immediately play a 1000ms silent MP3 after the card voice.
  // This keeps mobile audio focus from dropping to BGM only during the transition.
  await playSource(SILENCE_AFTER_CARD_SRC, runId, sequenceToken);
}

// Kept for compatibility with older imports. MP3 audio is now the production voice path.
export function speak(text, runId){
  return new Promise(resolve => {
    if(!text || !state.isPlaying || runId !== state.runId){
      resolve();
      return;
    }

    if(!('speechSynthesis' in window)){
      resolve();
      return;
    }

    startBgmQuietly();
    speechSynthesis.cancel();

    window.setTimeout(() => {
      if(!text || !state.isPlaying || runId !== state.runId){
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.88;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    }, 120);
  });
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

    startBgmQuietly();
    clearSilentTimer();

    silentEndTimer = window.setTimeout(() => {
      clearSilentTimer();
      forceQuietBgmElements();
      resolve();
    }, duration);
  });
}
