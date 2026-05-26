import { state } from './state.js';

let bgmContext = null;
let bgmGain = null;
let bgmOscillators = [];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function stopAllAudio() {
  state.speechToken += 1;
  window.speechSynthesis?.cancel();
  stopBgm();
}

export function startBgm() {
  if (bgmContext) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  bgmContext = new AudioContextClass();
  bgmGain = bgmContext.createGain();
  bgmGain.gain.value = 0.018;
  bgmGain.connect(bgmContext.destination);

  const notes = [261.63, 329.63, 392.0];
  bgmOscillators = notes.map((freq, index) => {
    const osc = bgmContext.createOscillator();
    const gain = bgmContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = index === 0 ? 0.22 : 0.12;
    osc.connect(gain).connect(bgmGain);
    osc.start();
    return osc;
  });
}

export function stopBgm() {
  bgmOscillators.forEach(osc => {
    try { osc.stop(); } catch (_) {}
  });
  bgmOscillators = [];

  if (bgmContext) {
    try { bgmContext.close(); } catch (_) {}
  }
  bgmContext = null;
  bgmGain = null;
}

function duckBgm(active) {
  if (!bgmGain || !bgmContext) return;
  const now = bgmContext.currentTime;
  bgmGain.gain.cancelScheduledValues(now);
  bgmGain.gain.linearRampToValueAtTime(active ? 0.006 : 0.018, now + 0.22);
}

export function speak(text, options = {}) {
  const token = state.speechToken;

  return new Promise((resolve) => {
    if (!text || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    duckBgm(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'zh-TW';
    utterance.rate = options.rate || 0.86;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    const done = () => {
      duckBgm(false);
      resolve();
    };

    utterance.onend = done;
    utterance.onerror = done;

    if (token !== state.speechToken || !state.isPlaying) {
      done();
      return;
    }

    window.speechSynthesis.speak(utterance);
  });
}

export async function playCardAudio(card) {
  if (!card || !state.isPlaying) return;
  await speak(card.zh, { lang: 'zh-TW', rate: 0.82 });
  if (!state.isPlaying) return;
  await sleep(1000);
  if (!state.isPlaying) return;
  await speak(card.sentence_zh, { lang: 'zh-TW', rate: 0.86 });
}
