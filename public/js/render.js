import { state, getCurrentCard } from './state.js';

const photo = document.getElementById('photo');
const photoWrap = document.querySelector('.photo-wrap');

const CONTENT_SWAP_DELAY_MS = 620;
const IMAGE_CROSSFADE_MS = 1900;
const textArea = document.querySelector('.text-area');
const wordZh = document.getElementById('wordZh');
const wordPinyin = document.getElementById('wordPinyin');
const wordJa = document.getElementById('wordJa');
const sentenceZh = document.getElementById('sentenceZh');
const sentencePinyin = document.getElementById('sentencePinyin');
const sentenceJa = document.getElementById('sentenceJa');
const chapterTitle = document.getElementById('chapterTitle');
const playlistTitle = document.getElementById('playlistTitle');
const progress = document.getElementById('progress');

let lastImage = '';
let transitionTimerId = null;
let handlingImageError = false;

function safeText(value){
  return typeof value === 'string' ? value : '';
}

function escapeSvgText(value){
  return safeText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function placeholderImage(card){
  const title = escapeSvgText(card?.wordZh || 'LingoFlow');
  const sub = escapeSvgText(card?.sentenceZh || 'image coming soon');
  const no = escapeSvgText(card?.id || 'card');
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#eee7dc"/>
    <rect x="72" y="72" width="1056" height="756" rx="44" fill="#f8f1e7" stroke="#d8c7af" stroke-width="3"/>
    <circle cx="230" cy="210" r="42" fill="#dfc9a8" opacity="0.72"/>
    <path d="M150 705 C290 560 405 610 520 500 C640 385 755 505 870 390 C955 310 1030 342 1095 298 L1095 780 L150 780 Z" fill="#e6d8c4"/>
    <text x="600" y="405" text-anchor="middle" font-size="82" fill="#3a3026" font-family="serif" letter-spacing="8">${title}</text>
    <text x="600" y="500" text-anchor="middle" font-size="34" fill="#8a6b44" font-family="serif">${sub}</text>
    <text x="600" y="620" text-anchor="middle" font-size="24" fill="#9b866d" font-family="serif">${no} / image coming soon</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function cardImageId(card){
  const rawId = safeText(card?.id);
  if(rawId) return rawId;

  const no = card?.cardNo ?? card?.no ?? card?.number;
  const num = Number(no);
  if(Number.isFinite(num) && num > 0){
    return `card_${String(num).padStart(3, '0')}`;
  }

  return '';
}

function currentImage(card){
  if(!card) return '';

  const id = cardImageId(card);

  // LingoFlow v2 fixed image rule:
  // images/card_001.png ... images/card_600.png
  // If the PNG file is not present yet, the img error handler shows the placeholder.
  if(id) return `images/${id}.png`;

  return placeholderImage(card);
}


function preparePhotoLayering(){
  if(!photo || !photoWrap) return;

  photoWrap.style.position = 'relative';
  photo.style.position = 'relative';
  photo.style.zIndex = '1';
}

function createImageFadeOverlay(){
  if(!photo || !photoWrap) return null;

  const visibleSrc = photo.currentSrc || photo.src || lastImage;
  if(!visibleSrc) return null;

  const overlay = document.createElement('img');
  overlay.src = visibleSrc;
  overlay.alt = '';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.className = 'photo-fade-overlay';

  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.maxWidth = 'none';
  overlay.style.maxHeight = 'none';
  overlay.style.objectFit = getComputedStyle(photo).objectFit || 'contain';
  overlay.style.objectPosition = getComputedStyle(photo).objectPosition || 'center center';
  overlay.style.background = getComputedStyle(photo).backgroundColor || '#eee7dc';
  overlay.style.opacity = '1';
  overlay.style.zIndex = '2';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = `opacity ${IMAGE_CROSSFADE_MS}ms cubic-bezier(.45,0,.2,1)`;

  photoWrap.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = '0';
    });
  });

  window.setTimeout(() => {
    overlay.remove();
  }, IMAGE_CROSSFADE_MS + 120);

  return overlay;
}

function setCardWithFade(card){
  if(!card || !photo) return;

  const src = currentImage(card);
  const shouldChangeImage = Boolean(src && src !== lastImage);

  clearTimeout(transitionTimerId);
  handlingImageError = false;

  preparePhotoLayering();

  // Text keeps the existing gentle fade.
  // Image is NOT faded by changing the same <img> opacity anymore.
  // A temporary overlay of the OLD image is faded out above the NEW image.
  if(textArea) textArea.classList.add('is-changing');

  transitionTimerId = setTimeout(() => {
    if(shouldChangeImage){
      createImageFadeOverlay();
      photo.classList.remove('is-changing');
      photo.style.opacity = '1';
      photo.src = src;
      lastImage = src;
    }

    photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');

    renderMeta(card);

    setText(wordZh, card.wordZh);
    setText(wordPinyin, card.wordPinyin);
    setText(wordJa, card.wordJa);
    setText(sentenceZh, card.sentenceZh);
    setText(sentencePinyin, card.sentencePinyin);
    setText(sentenceJa, card.sentenceJa);

    removeChangingClassesSmoothly();
  }, CONTENT_SWAP_DELAY_MS);
}

function setText(el, value){
  if(el) el.textContent = safeText(value);
}

function renderMeta(card){
  const chapterName = state.activeChapter?.title || card.chapterTitle || '';
  const playlistName = state.activePlaylist?.title || card.playlistTitle || '';
  const current = state.currentIndex + 1;
  const total = state.cards.length || state.weeklyInfo?.size || 20;

  // Render as ONE text node to prevent uneven gaps, size differences,
  // and baseline mismatch between chapter / playlist / progress.
  // Full-width spaces keep the visual separation stable in Japanese UI.
  const parts = [chapterName, playlistName, `${current} / ${total}`].filter(Boolean);
  setText(chapterTitle, parts.join('　'));

  // These elements are kept in HTML for compatibility, but intentionally emptied.
  setText(playlistTitle, '');
  setText(progress, '');
}

function removeChangingClassesSmoothly(){
  window.setTimeout(() => {
    requestAnimationFrame(() => {
      if(photo) photo.classList.remove('is-changing');
      if(textArea) textArea.classList.remove('is-changing');
    });
  }, 250);
}

if(photo){
  photo.addEventListener('load', () => {
    photo.classList.remove('is-initializing');
    removeChangingClassesSmoothly();
  });

  photo.addEventListener('error', () => {
    if(handlingImageError) return;
    handlingImageError = true;
    const fallback = placeholderImage(getCurrentCard());
    photo.src = fallback;
    lastImage = fallback;
    photo.classList.remove('is-initializing');
    removeChangingClassesSmoothly();
  });
}

export function renderCurrentCard(){
  const card = getCurrentCard();
  if(!card) return;

  setCardWithFade(card);
}

export function showError(message){
  const app = document.querySelector('.app');
  if(app) app.innerHTML = `<div class="error-message">${message}</div>`;
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
