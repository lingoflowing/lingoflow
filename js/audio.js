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

    markBgmUserStarted();
    startBgm();

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
  });
}

export function silentSpeechHold(ms, runId){
  return new Promise(resolve => {
    if(!state.isPlaying || runId !== state.runId) return resolve();
    if(!('speechSynthesis' in window)) {
      setTimeout(resolve, ms);
      return;
    }

    const startedAt = Date.now();

    function loop(){
      if(!state.isPlaying || runId !== state.runId) return resolve();

      const elapsed = Date.now() - startedAt;
      if(elapsed >= ms) return resolve();

      const utterance = new SpeechSynthesisUtterance('。');
      utterance.lang = 'zh-TW';
      utterance.volume = 0;
      utterance.rate = 0.5;
      utterance.pitch = 1;

      const voice = zhVoice();
      if(voice) utterance.voice = voice;

      utterance.onend = () => {
        requestAnimationFrame(loop);
      };

      utterance.onerror = () => {
        requestAnimationFrame(loop);
      };

      speechSynthesis.speak(utterance);
    }

    loop();
  });
}