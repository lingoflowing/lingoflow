import { state, getCurrentCard } from './state.js';

const photo = document.getElementById('photo');
const photoWrap = document.querySelector('.photo-wrap');

const CONTENT_SWAP_DELAY_MS = 1050;
const IMAGE_CROSSFADE_MS = 1900;
const IMAGE_OVERLAY_REMOVE_BUFFER_MS = 160;

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
let renderToken = 0;
let hasRenderedOnce = false;
let lastRenderedCardKey = '';
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

  // Prefer existing image metadata when present.
  // Fallback to the fixed card_001.png ... card_600.png rule.
  if(card.image) return card.image;
  if(card.imageMeta?.imagePath) return card.imageMeta.imagePath;
  if(card.imageFile) return `images/${card.imageFile}`;
  if(id) return `images/${id}.png`;

  return placeholderImage(card);
}

function setText(el, value){
  if(el) el.textContent = safeText(value);
}

function renderMeta(card){
  const chapterName = state.activeChapter?.title || card.chapterTitle || '';
  const playlistName = state.activePlaylist?.title || card.playlistTitle || '';
  const current = state.currentIndex + 1;
  const total = state.cards.length || state.weeklyInfo?.size || 20;

  const parts = [chapterName, playlistName, `${current} / ${total}`].filter(Boolean);
  setText(chapterTitle, parts.join('　'));

  setText(playlistTitle, '');
  setText(progress, '');
}

function renderKey(card, src){
  const id = safeText(card?.id) || safeText(card?.cardId) || safeText(card?.cardNo) || String(state.currentIndex);
  return `${id}|${safeText(src)}`;
}

function renderText(card){
  renderMeta(card);

  setText(wordZh, card.wordZh);
  setText(wordPinyin, card.wordPinyin);
  setText(wordJa, card.wordJa);
  setText(sentenceZh, card.sentenceZh);
  setText(sentencePinyin, card.sentencePinyin);
  setText(sentenceJa, card.sentenceJa);
}


function restoreTextTransitionSoon(){
  if(!textArea) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      textArea.classList.remove('no-text-transition');
    });
  });
}

function renderTextImmediately(card){
  if(textArea){
    textArea.classList.add('no-text-transition');
    textArea.classList.remove('is-changing');
    textArea.style.opacity = '1';
  }

  renderText(card);

  // Force style application now, so the first card never animates from the
  // previous .is-changing / transition state. This is intentionally limited
  // to first render and same-card re-render.
  if(textArea) void textArea.offsetHeight;
  restoreTextTransitionSoon();
}

function ensurePhotoLayout(){
  if(!photo || !photoWrap) return;

  photoWrap.style.position = 'relative';
  photo.style.position = 'relative';
  photo.style.zIndex = '1';
}

function removeExistingOverlay(){
  if(overlayTimerId){
    clearTimeout(overlayTimerId);
    overlayTimerId = null;
  }

  document.querySelectorAll('.photo-fade-overlay').forEach(el => el.remove());
}

function makeOverlayFromCurrentImage(){
  if(!photo || !photoWrap) return null;

  const visibleSrc = photo.currentSrc || photo.src || lastImage;
  if(!visibleSrc) return null;

  const overlay = document.createElement('img');
  overlay.src = visibleSrc;
  overlay.alt = '';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.className = 'photo-fade-overlay';

  const computed = getComputedStyle(photo);
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.maxWidth = 'none';
  overlay.style.maxHeight = 'none';
  overlay.style.objectFit = computed.objectFit || 'contain';
  overlay.style.objectPosition = computed.objectPosition || 'center center';
  overlay.style.background = computed.backgroundColor || '#eee7dc';
  overlay.style.opacity = '1';
  overlay.style.zIndex = '2';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = `opacity ${IMAGE_CROSSFADE_MS}ms cubic-bezier(.45,0,.2,1)`;

  photoWrap.appendChild(overlay);
  return overlay;
}

function fadeOutOverlay(overlay){
  if(!overlay) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = '0';
    });
  });

  overlayTimerId = window.setTimeout(() => {
    overlay.remove();
    overlayTimerId = null;
  }, IMAGE_CROSSFADE_MS + IMAGE_OVERLAY_REMOVE_BUFFER_MS);
}

function setImageImmediately(src, card){
  if(!photo || !src) return;

  handlingImageError = false;
  photo.classList.remove('is-changing');
  photo.style.opacity = '1';
  photo.style.visibility = 'visible';
  photo.src = src;
  photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');
  lastImage = src;
}

function crossfadeToImage(src, card){
  if(!photo || !src) return;

  ensurePhotoLayout();

  const shouldChangeImage = src !== lastImage;
  photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');

  if(!shouldChangeImage) return;

  handlingImageError = false;

  const overlay = makeOverlayFromCurrentImage();

  // The main image remains fully visible. We change only its src.
  // The old image is preserved in the overlay and fades out above it.
  photo.classList.remove('is-changing');
  photo.style.opacity = '1';
  photo.style.visibility = 'visible';
  photo.src = src;
  lastImage = src;

  fadeOutOverlay(overlay);
}

function removeChangingClassesSmoothly(){
  window.setTimeout(() => {
    requestAnimationFrame(() => {
      if(photo) photo.classList.remove('is-changing');
      if(textArea) textArea.classList.remove('is-changing');
    });
  }, 250);
}

function setCardWithFade(card){
  if(!card || !photo) return;

  const token = ++renderToken;
  const src = currentImage(card);
  const key = renderKey(card, src);

  clearTimeout(transitionTimerId);
  ensurePhotoLayout();

  // First render must be immediate.
  // This prevents the blank screen caused by waiting for a fade before any
  // image/text has ever been displayed.
  if(!hasRenderedOnce){
    hasRenderedOnce = true;
    removeExistingOverlay();
    renderTextImmediately(card);
    setImageImmediately(src, card);
    lastRenderedCardKey = key;
    if(textArea) textArea.classList.remove('is-changing');
    photo.classList.remove('is-initializing');
    return;
  }

  // Re-rendering the same first/current card must not fade the word/sentence.
  // This happens when playback starts: app.js calls renderCurrentCard() again
  // even though the first card is already visible from page load.
  if(key === lastRenderedCardKey){
    removeExistingOverlay();
    renderTextImmediately(card);
    photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');
    if(textArea) textArea.classList.remove('is-changing');
    if(photo){
      photo.classList.remove('is-changing', 'is-initializing');
      photo.style.opacity = '1';
      photo.style.visibility = 'visible';
    }
    return;
  }

  if(textArea) textArea.classList.add('is-changing');

  transitionTimerId = window.setTimeout(() => {
    if(token !== renderToken) return;

    renderText(card);
    crossfadeToImage(src, card);
    lastRenderedCardKey = key;
    removeChangingClassesSmoothly();
  }, CONTENT_SWAP_DELAY_MS);
}

if(photo){
  photo.addEventListener('load', () => {
    photo.classList.remove('is-initializing');
    photo.style.visibility = 'visible';
    photo.style.opacity = '1';
  });

  photo.addEventListener('error', () => {
    if(handlingImageError) return;
    handlingImageError = true;

    const fallback = placeholderImage(getCurrentCard());
    photo.classList.remove('is-changing');
    photo.style.opacity = '1';
    photo.style.visibility = 'visible';
    photo.src = fallback;
    lastImage = fallback;
    lastRenderedCardKey = renderKey(getCurrentCard(), fallback);
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
  if(!card || !photo) return;

  const src = currentImage(card);
  if(src && src !== lastImage){
    setImageImmediately(src, card);
  }
}
