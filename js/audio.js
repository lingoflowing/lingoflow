import { state } from './state.js';
import { clearTimer } from './timer.js';
import { startBgm, stopBgm, markBgmUserStarted } from './bgm.js';

export function stopAllAudio(){
  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }
}

// Phase66 BGM:
// 再生開始時に呼ぶ共通関数。
// 既存コードで state.isPlaying = true を直接書いている場合は、
// そこを startPlayback() に置き換える。
export function startPlayback(){
  state.isPlaying = true;
  state.runId++;
  clearTimer();

  // iPhone/Safari対策：ユーザー操作後フラグを立ててからBGM開始
  markBgmUserStarted();
  startBgm();

  return state.runId;
}

export function stopPlayback(){
  state.isPlaying = false;
  state.runId++;
  clearTimer();
  stopAllAudio();

  // Phase66 BGM: 停止時はBGMも必ず停止
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
    if(!text || !state.isPlaying || runId !== state.runId) return resolve();
    if(!('speechSynthesis' in window)) return resolve();

    // Phase66 BGM fallback:
    // startPlayback() を通らない既存再生処理でも、音声再生直前にBGM開始を試す。
    // ただし、最も安定するのは再生ボタン押下時に startPlayback() を呼ぶ方法。
    markBgmUserStarted();
    startBgm();

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';

    const voice = zhVoice();
    if(voice) utterance.voice = voice;

    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    speechSynthesis.speak(utterance);
  });
}
