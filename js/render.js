// LingoFlow v55.1 render.js
// DOM rendering and hidden-state control only. No :empty dependency.

const $ = (id) => document.getElementById(id);

export const elements = {
  app: $('app'),
  card: $('card'),
  imageArea: $('imageArea'),
  cardImage: $('cardImage'),
  wordBlock: $('wordBlock'),
  wordZh: $('wordZh'),
  wordPinyin: $('wordPinyin'),
  wordJa: $('wordJa'),
  sentenceBlock: $('sentenceBlock'),
  sentenceZh: $('sentenceZh'),
  sentencePinyin: $('sentencePinyin'),
  sentenceJa: $('sentenceJa'),
  playButton: $('playButton'),
  statusText: $('statusText'),
};

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

function setText(el, value) {
  if (!el) return;
  el.textContent = clean(value);
}

function setHidden(el, shouldHide) {
  if (!el) return;
  el.classList.toggle('is-hidden', Boolean(shouldHide));
  el.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
}

function hasAnyText(values) {
  return values.some((value) => clean(value).length > 0);
}

export function renderWord(word = {}) {
  const zh = clean(word.zh);
  const pinyin = clean(word.pinyin);
  const ja = clean(word.ja);

  setText(elements.wordZh, zh);
  setText(elements.wordPinyin, pinyin);
  setText(elements.wordJa, ja);
  setHidden(elements.wordBlock, !hasAnyText([zh, pinyin, ja]));
}

export function renderSentence(sentence = {}) {
  const zh = clean(sentence.zh);
  const pinyin = clean(sentence.pinyin);
  const ja = clean(sentence.ja);

  setText(elements.sentenceZh, zh);
  setText(elements.sentencePinyin, pinyin);
  setText(elements.sentenceJa, ja);
  setHidden(elements.sentenceBlock, !hasAnyText([zh, pinyin, ja]));
}

export function renderCard(card = {}) {
  renderWord(card.word || {});
  renderSentence(card.sentence || {});

  const imageSrc = clean(card.image);
  if (elements.cardImage) {
    if (imageSrc) {
      elements.cardImage.src = imageSrc;
      elements.cardImage.alt = clean(card.imageAlt || '');
    } else {
      elements.cardImage.removeAttribute('src');
      elements.cardImage.alt = '';
    }
  }
  setHidden(elements.imageArea, !imageSrc);
}

export function renderPlaying(isPlaying) {
  elements.playButton.textContent = isPlaying ? '■' : '▶︎';
  elements.playButton.setAttribute('aria-label', isPlaying ? '停止' : '再生');
  elements.app.classList.toggle('is-playing', Boolean(isPlaying));
}

export function renderStatus(message) {
  setText(elements.statusText, message);
}
