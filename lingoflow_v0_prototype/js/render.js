import { state, currentCard } from './state.js';

const els = {
  card: document.getElementById('card'),
  imageLabel: document.getElementById('imageLabel'),
  theme: document.getElementById('theme'),
  wordZh: document.getElementById('wordZh'),
  wordPinyin: document.getElementById('wordPinyin'),
  wordJa: document.getElementById('wordJa'),
  sentenceZh: document.getElementById('sentenceZh'),
  sentencePinyin: document.getElementById('sentencePinyin'),
  sentenceJa: document.getElementById('sentenceJa'),
  playButton: document.getElementById('playButton'),
  status: document.getElementById('status'),
  counter: document.getElementById('counter')
};

export function renderCard(){
  const card = currentCard();
  if(!card) return;
  els.card.classList.add('fade');
  window.setTimeout(() => {
    els.imageLabel.textContent = card.image_label || '流';
    els.theme.textContent = card.theme || '';
    els.wordZh.textContent = card.zh;
    els.wordPinyin.textContent = card.pinyin;
    els.wordJa.textContent = card.ja;
    els.sentenceZh.textContent = card.sentence_zh;
    els.sentencePinyin.textContent = card.sentence_pinyin;
    els.sentenceJa.textContent = card.sentence_ja;
    els.counter.textContent = `${state.currentIndex + 1} / ${state.cards.length}`;
    els.card.classList.remove('fade');
  }, 120);
}

export function renderPlayState(){
  els.playButton.textContent = state.isPlaying ? '■' : '▶';
  els.playButton.setAttribute('aria-label', state.isPlaying ? '停止' : '再生');
  els.status.textContent = state.isPlaying ? '再生中' : '停止中';
}

export function renderError(message){
  els.theme.textContent = '読み込みエラー';
  els.wordZh.textContent = 'LingoFlow';
  els.wordPinyin.textContent = '';
  els.wordJa.textContent = message;
  els.sentenceZh.textContent = '';
  els.sentencePinyin.textContent = '';
  els.sentenceJa.textContent = '';
}
