import { state } from './state.js';
import { clearTimer } from './timer.js';
import { startBgm, stopBgm, markBgmUserStarted } from './bgm.js';

const BGM_SAFE_VOLUME = 0.01;

let silentTimer = null;
let silentUtterance = null;

function forceQuietBgmElements(){
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
  if(silentTimer){
    clearTimeout(silentTimer);
    silentTimer = null;
  }
  silentUtterance = null;
}

export function stopAllAudio(){
  clearSilentTimer();

  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }
}

export function startPlayback(){
  state.isPlaying = true;
  state.runId++;
  clearTimer();
  clearSilentTimer();

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

function zhVoice(){
  if(!('speechSynthesis' in window)) return null;

  const voices = speechSynthesis.getVoices();

  return voices.find(v => v.lang === 'zh-TW')
      || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('zh'))
      || null;
}

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

    clearSilentTimer();
    speechSynthesis.cancel();

    // Give the browser a short breath after cancel().
    // This prevents short words from being skipped while preserving speakSilent().
    window.setTimeout(() => {
      if(!text || !state.isPlaying || runId !== state.runId){
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';

      const voice = zhVoice();
      if(voice) utterance.voice = voice;

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

    let resolved = false;

    const done = () => {
      if(resolved) return;
      resolved = true;
      clearSilentTimer();
      resolve();
    };

    if(!('speechSynthesis' in window)){
      silentTimer = window.setTimeout(done, duration);
      return;
    }

    clearSilentTimer();
    speechSynthesis.cancel();

    silentUtterance = new SpeechSynthesisUtterance('。');
    silentUtterance.lang = 'zh-TW';
    silentUtterance.volume = 0;
    silentUtterance.rate = 0.1;
    silentUtterance.pitch = 1;

    const voice = zhVoice();
    if(voice) silentUtterance.voice = voice;

    silentUtterance.onerror = () => {};
    silentUtterance.onend = () => {};

    speechSynthesis.speak(silentUtterance);

    silentTimer = window.setTimeout(() => {
      if('speechSynthesis' in window){
        speechSynthesis.cancel();
      }
      done();
    }, duration);
  });
}