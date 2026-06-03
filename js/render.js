import { getCurrentCard } from './state.js';

const photo = document.getElementById('photo');
const wordZh = document.getElementById('wordZh');
const wordPinyin = document.getElementById('wordPinyin');
const wordJa = document.getElementById('wordJa');
const sentenceZh = document.getElementById('sentenceZh');
const sentencePinyin = document.getElementById('sentencePinyin');
const sentenceJa = document.getElementById('sentenceJa');

let lastImage = '';
let transitionTimerId = null;


function safeText(value){
  return typeof value === 'string' ? value : '';
}

function currentImage(card){
  if(!card) return '';
  return card.image;
}

function setImageWithFade(src){
  if(!src || !photo) return;

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

function setText(el, value){
  if(el) el.textContent = safeText(value);
}

if(photo){
  photo.addEventListener('load', () => {
    requestAnimationFrame(() => {
      photo.classList.remove('is-changing');
    });
  });

  photo.addEventListener('error', () => {
    photo.classList.remove('is-changing');
  });
}

export function renderCurrentCard(){
  const card = getCurrentCard();
  if(!card) return;

  setImageWithFade(currentImage(card));
  if(photo) photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');

  setText(wordZh, card.wordZh);
  setText(wordPinyin, card.wordPinyin);
  setText(wordJa, card.wordJa);
  setText(sentenceZh, card.sentenceZh);
  setText(sentencePinyin, card.sentencePinyin);
  setText(sentenceJa, card.sentenceJa);
}

export function showError(message){
  const app = document.querySelector('.app');
  app.innerHTML = `<div class="error-message">${message}</div>`;
}

export function rerenderForViewport(){
  const card = getCurrentCard();
  if(!card) return;

  const src = currentImage(card);
  if(photo && src !== lastImage){
    photo.src = src;
    lastImage = src;
  }
}
