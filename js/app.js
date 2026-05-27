// LingoFlow v55.1 app.js
// Minimal stable app: state, event, and audio. Rendering is delegated to render.js.

import { renderCard, renderPlaying, renderStatus, elements } from './render.js';

const cards = [
  {
    type: 'word',
    zh: '你好',
    pinyin: 'nǐ hǎo',
    ja: 'こんにちは',
  },
  {
    type: 'sentence',
    zh: '我想喝一杯咖啡。',
    pinyin: 'wǒ xiǎng hē yì bēi kā fēi',
    ja: '私はコーヒーを一杯飲みたいです。',
  },
];

const state = {
  index: 0,
  isPlaying: false,
  utterance: null,
};

function currentCardPayload() {
  const item = cards[state.index] || cards[0];
  if (item.type === 'sentence') {
    return {
      word: {},
      sentence: { zh: item.zh, pinyin: item.pinyin, ja: item.ja },
      image: '',
    };
  }
  return {
    word: { zh: item.zh, pinyin: item.pinyin, ja: item.ja },
    sentence: {},
    image: '',
  };
}

function renderCurrent() {
  renderCard(currentCardPayload());
}

function stopAudio(message = '停止しました') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  state.utterance = null;
  state.isPlaying = false;
  renderPlaying(false);
  renderStatus(message);
}

function playCurrent() {
  stopAudio('');
  const item = cards[state.index] || cards[0];

  state.isPlaying = true;
  renderPlaying(true);
  renderStatus('再生中');

  if (!('speechSynthesis' in window)) {
    renderStatus('このブラウザでは音声再生に対応していません');
    state.isPlaying = false;
    renderPlaying(false);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(item.zh);
  utterance.lang = 'zh-TW';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  state.utterance = utterance;

  utterance.onend = () => {
    state.index = (state.index + 1) % cards.length;
    state.isPlaying = false;
    state.utterance = null;
    renderPlaying(false);
    renderCurrent();
    renderStatus('押すと静かに始まります');
  };

  utterance.onerror = () => {
    state.isPlaying = false;
    state.utterance = null;
    renderPlaying(false);
    renderStatus('音声を停止しました');
  };

  window.speechSynthesis.speak(utterance);
}

function togglePlayback() {
  if (state.isPlaying) {
    stopAudio('停止しました');
    return;
  }
  playCurrent();
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopAudio('停止しました');
  }
}

function init() {
  renderCurrent();
  renderPlaying(false);
  renderStatus('押すと静かに始まります');

  elements.playButton.addEventListener('click', togglePlayback);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', () => stopAudio('停止しました'));
}

init();
