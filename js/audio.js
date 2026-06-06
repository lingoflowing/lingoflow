import { state } from './state.js';
import { clearTimer } from './timer.js';
import {
  startBgm,
  stopBgm,
  markBgmUserStarted,
  quietBgmForTransition
} from './bgm.js';

export function stopAllAudio(){
  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }
}

export function startPlayback(){
  state.isPlaying = true;
  state.runId++;
  clearTimer();

  markBgmUserStarted();
  quietBgmForTransition(1200);
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
    // ここで speechSynthesis.cancel() しない。
    // 毎回cancelすると、iPhone/SafariでBGMが一瞬前に出やすい。

    quietBgmForTransition(1500);

    markBgmUserStarted();
    startBgm();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';

    const voice = zhVoice();
    if(voice) utterance.voice = voice;

    utterance.rate = 0.88;
    utterance.pitch = 1;

    utterance.onstart = () => {
      quietBgmForTransition(1500);
    };

    utterance.onend = () => {
      quietBgmForTransition(1500);
      resolve();
    };

    utterance.onerror = () => {
      quietBgmForTransition(1500);
      resolve();
    };

    speechSynthesis.speak(utterance);
  });
}