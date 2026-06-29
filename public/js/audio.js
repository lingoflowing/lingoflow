import { state } from './state.js?v=phase130-hibilingo-20260629';
import { clearTimer } from './timer.js?v=phase130-hibilingo-20260629';
import { stopBgm } from './bgm.js?v=phase130-hibilingo-20260629';

const TRAILING_SILENCE_MS = 1000;

let cardAudio = null;
let activeAudioRunId = 0;
let silentTimer = null;

function ensureCardAudio(){
  if(cardAudio) return cardAudio;

  cardAudio = document.createElement('audio');
  cardAudio.id = 'cardZhAudio';
  cardAudio.preload = 'auto';
  cardAudio.setAttribute('playsinline', '');
  cardAudio.volume = 1;
  document.body.appendChild(cardAudio);
  return cardAudio;
}

function clearSilentTimer(){
  if(silentTimer){
    clearTimeout(silentTimer);
    silentTimer = null;
  }
}

function stopBgmHard(){
  stopBgm();
  document.querySelectorAll('audio').forEach(audio => {
    const key = `${audio.id || ''} ${audio.className || ''} ${audio.src || ''}`.toLowerCase();
    if(key.includes('bgm') || key.includes('music') || key.includes('piano')){
      try{
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        audio.muted = true;
        audio.src = '';
        audio.removeAttribute('src');
        audio.load?.();
      }catch(_error){}
    }
  });
}

function cardNoFromCard(card){
  const raw = card?.cardNo ?? card?.no ?? card?.number;
  const numeric = Number(raw);

  if(Number.isFinite(numeric) && numeric > 0) return numeric;

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

function waitMs(ms, runId){
  return new Promise(resolve => {
    if(!state.isPlaying || runId !== state.runId){
      resolve();
      return;
    }

    clearSilentTimer();
    silentTimer = window.setTimeout(() => {
      silentTimer = null;
      resolve();
    }, Math.max(0, Number(ms) || 0));
  });
}

function playSrc(src, runId){
  return new Promise(resolve => {
    if(!src || !state.isPlaying || runId !== state.runId){
      resolve();
      return;
    }

    const audio = ensureCardAudio();
    activeAudioRunId += 1;
    const token = activeAudioRunId;

    const done = () => {
      audio.removeEventListener('ended', done);
      audio.removeEventListener('error', done);
      if(token === activeAudioRunId) resolve();
    };

    try{
      audio.pause();
      audio.currentTime = 0;
    }catch(_error){}

    audio.addEventListener('ended', done);
    audio.addEventListener('error', done);
    audio.volume = 1;
    audio.muted = false;
    audio.src = src;
    audio.load();

    audio.play().catch(() => {
      done();
    });
  });
}

export function stopAllAudio(){
  clearSilentTimer();
  activeAudioRunId += 1;

  if(cardAudio){
    try{
      cardAudio.pause();
      cardAudio.currentTime = 0;
    }catch(_error){}
  }

  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }

  stopBgmHard();
}

export function startPlayback(){
  state.isPlaying = true;
  state.runId++;
  clearTimer();
  clearSilentTimer();
  ensureCardAudio();
  stopBgmHard();
  return state.runId;
}

export function stopPlayback(){
  state.isPlaying = false;
  state.runId++;
  clearTimer();
  stopAllAudio();
}

export async function playCardZhAudio(card, runId){
  if(!card || !state.isPlaying || runId !== state.runId) return;

  stopBgmHard();

  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }

  const src = zhAudioPath(card);
  if(!src) return;

  await playSrc(src, runId);
  if(!state.isPlaying || runId !== state.runId) return;

  // BGMは使わず、カード音声後の余韻だけをタイマーで保持する。
  await waitMs(TRAILING_SILENCE_MS, runId);
}

export function speak(_text, runId){
  return waitMs(0, runId);
}

export function speakSilent(durationMs = 800, runId){
  stopBgmHard();
  return waitMs(durationMs, runId);
}
