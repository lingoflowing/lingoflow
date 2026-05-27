let currentUtterance = null;
let zhVoice = null;

function findTaiwanVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return (
    voices.find(v => /zh[-_]TW/i.test(v.lang)) ||
    voices.find(v => /zh/i.test(v.lang)) ||
    null
  );
}

export function prepareVoice() {
  if (!('speechSynthesis' in window)) return;
  zhVoice = findTaiwanVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    zhVoice = findTaiwanVoice();
  };
}

export function stopAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function speakZh(text, runId, getRunId) {
  stopAudio();

  if (!('speechSynthesis' in window) || !text) {
    return Promise.resolve(true);
  }

  return new Promise(resolve => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.82;
    utterance.pitch = 0.95;
    utterance.volume = 1;
    if (zhVoice) utterance.voice = zhVoice;

    currentUtterance = utterance;

    utterance.onend = () => {
      currentUtterance = null;
      resolve(getRunId() === runId);
    };

    utterance.onerror = () => {
      currentUtterance = null;
      resolve(getRunId() === runId);
    };

    window.speechSynthesis.speak(utterance);
  });
}
