
function getCardImagePath(card) {
  return card.imageFile || card.image || card.imagePath || card.img || "";
}
function getWordZh(card) { return card.wordZh || card.zh || ""; }
function getWordPinyin(card) { return card.wordPinyin || card.pinyin || ""; }
function getWordJa(card) { return card.wordJa || card.ja || ""; }
function getSentenceZh(card) { return card.sentenceZh || card.sentence_zh || ""; }
function getSentencePinyin(card) { return card.sentencePinyin || card.sentence_pinyin || ""; }
function getSentenceJa(card) { return card.sentenceJa || card.sentence_ja || ""; }

import { getCurrentCard } from './state.js';

const photo = document.getElementById('photo');

let lastImage = '';
let transitionTimerId = null;

function usePortraitImage(){
  return window.matchMedia('(orientation: portrait) and (max-width: 700px)').matches;
}

function safeText(value){
  return typeof value === 'string' ? value : '';
}

function currentImage(card){
  if(!card) return '';
  return usePortraitImage() && card.imagePortrait ? card.imagePortrait : card.image;
}

function setImageWithFade(src){
  if(!src) return;

  if(src === lastImage){
    photo.classList.remove('is-changing');
    return;
  }

  clearTimeout(transitionTimerId);
  photo.classList.add('is-changing');

  transitionTimerId = setTimeout(() => {
    photo.src = src;
    lastImage = src;
  }, 180);
}

photo.addEventListener('load', () => {
  requestAnimationFrame(() => {
    photo.classList.remove('is-changing');
  });
});

photo.addEventListener('error', () => {
  photo.classList.remove('is-changing');
});

export function renderCurrentCard(){
  const card = getCurrentCard();
  if(!card) return;

  setImageWithFade(currentImage(card));
  photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');
}

export function showError(message){
  const app = document.querySelector('.app');
  app.innerHTML = `<div class="error-message">${message}</div>`;
}

export function rerenderForViewport(){
  const card = getCurrentCard();
  if(!card) return;

  const src = currentImage(card);
  if(src !== lastImage){
    photo.src = src;
    lastImage = src;
  }
}
