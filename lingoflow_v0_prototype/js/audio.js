import { state } from './state.js';

function chooseVoice(){
  const voices = window.speechSynthesis?.getVoices?.() || [];
  state.voice =
    voices.find(v => /zh[-_](TW|Hant)/i.test(v.lang)) ||
    voices.find(v => /zh[-_]/i.test(v.lang)) ||
    null;
}

if ('speechSynthesis' in window) {
  chooseVoice();
  window.speechSynthesis.onvoiceschanged = chooseVoice;
}

export function stopAllAudio(){
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio.currentTime = 0;
    state.currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function speakText(text){
  return new Promise(resolve => {
    if (!state.isPlaying || !('speechSynthesis' in window)) return resolve();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-TW';
    utter.rate = 0.86;
    utter.pitch = 1;
    utter.volume = 0.95;
    if (state.voice) utter.voice = state.voice;
    utter.onend = resolve;
    utter.onerror = resolve;
    window.speechSynthesis.speak(utter);
  });
}

function playFile(src){
  return new Promise(resolve => {
    if (!state.isPlaying || !src) return resolve();
    const audio = new Audio(src);
    state.currentAudio = audio;
    audio.onended = resolve;
    audio.onerror = resolve;
    audio.play().catch(resolve);
  });
}

export async function playWord(card){
  if (card.audio_word) return playFile(card.audio_word);
  return speakText(card.zh);
}

export async function playSentence(card){
  if (card.audio_sentence) return playFile(card.audio_sentence);
  return speakText(card.sentence_zh);
}
