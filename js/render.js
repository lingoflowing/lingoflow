import { getCurrentCard } from './state.js';

const photo = document.getElementById('photo');

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

export function renderCurrentCard(){
  const card = getCurrentCard();
  if(!card) return;

  photo.src = currentImage(card);
  photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');
}

export function showError(message){
  const app = document.querySelector('.app');
  app.innerHTML = `<div class="error-message">${message}</div>`;
}

export function rerenderForViewport(){
  renderCurrentCard();
}
