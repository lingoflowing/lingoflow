import { state } from './state.js';
import { clearTimer } from './timer.js';
import { startBgm, stopBgm, markBgmUserStarted } from './bgm.js';

export function stopAllAudio(){
  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }
}

export function startPlayback(){
  state.isPlaying = true;
  state.runId++;
  clearTimer();

  // BGM開始はここだけに集約
  // 画像切り替え・speak()ごとには呼ばない
  markBgmUserStarted();
  startBgm();

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
    if(!text || !state.isPlaying || runId !== state.runId) return resolve();
    if(!('speechSynthesis' in window)) return resolve();

    // 重要：
    // ここで startBgm() を呼ばない。
    // speak() はカード・文ごとに何度も呼ばれるため、
    // BGM多重呼び出しの原因になる。

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