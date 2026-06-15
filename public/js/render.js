import { state, getCurrentCard } from './state.js';

const photo = document.getElementById('photo');
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
let overlayTimerId = null;
let activeImageOverlay = null;
let handlingImageError = false;

// Content swap timing stays close to the previous behavior.
// Image smoothness is handled by a temporary overlay crossfade, not by delaying src.
const CONTENT_SWAP_DELAY_MS = 620;
const IMAGE_CROSSFADE_MS = 1750;

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

function cleanupImageOverlay(){
  clearTimeout(overlayTimerId);
  overlayTimerId = null;

  if(activeImageOverlay?.parentNode){
    activeImageOverlay.parentNode.removeChild(activeImageOverlay);
  }

  activeImageOverlay = null;
}

function createImageOverlay(){
  if(!photo || !photo.parentElement || !photo.currentSrc && !photo.src) return null;

  cleanupImageOverlay();

  const wrap = photo.parentElement;
  const computed = window.getComputedStyle(photo);
  const wrapComputed = window.getComputedStyle(wrap);

  if(wrapComputed.position === 'static'){
    wrap.style.position = 'relative';
  }

  const overlay = document.createElement('img');
  overlay.alt = '';
  overlay.src = photo.currentSrc || photo.src;
  overlay.setAttribute('aria-hidden', 'true');

  Object.assign(overlay.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: computed.objectFit || 'contain',
    objectPosition: computed.objectPosition || 'center center',
    background: computed.backgroundColor || '#eee7dc',
    pointerEvents: 'none',
    opacity: '1',
    zIndex: '2',
    transition: `opacity ${IMAGE_CROSSFADE_MS}ms cubic-bezier(.45,0,.2,1)`
  });

  wrap.appendChild(overlay);
  activeImageOverlay = overlay;

  return overlay;
}

function crossfadeToImage(src){
  if(!photo || !src || src === lastImage) return;

  const hasVisibleImage = Boolean(lastImage && photo.src);
  const overlay = hasVisibleImage ? createImageOverlay() : null;

  photo.classList.remove('is-changing');
  photo.src = src;
  lastImage = src;

  if(overlay){
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
      });
    });

    overlayTimerId = window.setTimeout(() => {
      cleanupImageOverlay();
    }, IMAGE_CROSSFADE_MS + 180);
  }
}

function setCardWithFade(card){
  if(!card || !photo) return;

  const src = currentImage(card);
  const shouldChangeImage = Boolean(src && src !== lastImage);

  clearTimeout(transitionTimerId);
  handlingImageError = false;

  if(textArea) textArea.classList.add('is-changing');

  transitionTimerId = setTimeout(() => {
    photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');

    if(shouldChangeImage){
      crossfadeToImage(src);
    }

    renderMeta(card);

    setText(wordZh, card.wordZh);
    setText(wordPinyin, card.wordPinyin);
    setText(wordJa, card.wordJa);
    setText(sentenceZh, card.sentenceZh);
    setText(sentencePinyin, card.sentencePinyin);
    setText(sentenceJa, card.sentenceJa);

    requestAnimationFrame(() => {
      if(textArea) textArea.classList.remove('is-changing');
    });
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

if(photo){
  photo.addEventListener('load', () => {
    photo.classList.remove('is-initializing');
  });

  photo.addEventListener('error', () => {
    if(handlingImageError) return;
    handlingImageError = true;
    const fallback = placeholderImage(getCurrentCard());
    crossfadeToImage(fallback);
    photo.classList.remove('is-initializing');
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
    cleanupImageOverlay();
    photo.src = src;
    lastImage = src;
  }
}
