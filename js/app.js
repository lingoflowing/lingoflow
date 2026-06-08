import { state, getCurrentCard, nextCard } from './state.js';
import { renderCurrentCard, rerenderForViewport, showError } from './render.js';
import { clearTimer } from './timer.js';
import {
  speak,
  speakSilent,
  startPlayback as startAudioPlayback,
  stopPlayback,
  stopAllAudio
} from './audio.js';
import { PLAY_SVG, STOP_SVG } from './icons.js';
import { track } from './analytics.js';

const button = document.getElementById('playStopButton');
const icon = document.getElementById('playStopIcon');

function updateButton(){
  button.classList.toggle('is-playing', state.isPlaying);
  icon.innerHTML = state.isPlaying ? STOP_SVG : PLAY_SVG;
  button.setAttribute('aria-label', state.isPlaying ? '停止' : '再生');
}

function textSequence(card){
  return [card.wordZh, card.sentenceZh].filter(Boolean);
}

async function playLoop(runId){
  while(state.isPlaying && runId === state.runId){
    const card = getCurrentCard();
    if(!card) break;

    renderCurrentCard();
    track('card_view', {
      index: state.currentIndex,
      total: state.cards.length,
      id: card.id || null,
      chapterNo: card.chapterNo || null,
      playlistNo: card.playlistNo || null
    });

    await speakSilent(900, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    for(const text of textSequence(card)){
      await speak(text, runId);
      if(!state.isPlaying || runId !== state.runId) break;

      await speakSilent(700, runId);
      if(!state.isPlaying || runId !== state.runId) break;
    }

    await speakSilent(1800, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    track('card_complete', {
      index: state.currentIndex,
      total: state.cards.length,
      id: card.id || null,
      chapterNo: card.chapterNo || null,
      playlistNo: card.playlistNo || null
    });
    nextCard();
  }
}

function startPlayback(){
  if(state.isPlaying || !state.cards.length) return;

  track('play_start', { index: state.currentIndex, total: state.cards.length });
  const runId = startAudioPlayback();
  updateButton();
  playLoop(runId);
}

function stopAndRender(){
  if(state.isPlaying) track('play_stop', { index: state.currentIndex, total: state.cards.length });
  stopPlayback();
  updateButton();
}

async function loadJson(path){
  const response = await fetch(path, { cache: 'no-store' });
  if(!response.ok) throw new Error(`${path} load failed`);
  return response.json();
}

function mergeCardsAndImages(cards, images){
  const imageByCardId = new Map((images || []).map(image => [image.cardId, image]));

  return cards.map(card => {
    const imageMeta = imageByCardId.get(card.id) || card.imageMeta || null;
    const image = imageMeta?.imagePath || card.image || (card.imageFile ? `images/${card.imageFile}` : '');

    return {
      ...card,
      image,
      imageMeta
    };
  });
}

async function loadCards(){
  // v2本命: data/cards.json + data/images.json を必ず読む。
  // ここで旧 data.json へ安易に戻すと、30件版を読んで30→1に戻る原因になる。
  const [cards, images, playlists, chapters] = await Promise.all([
    loadJson('data/cards.json'),
    loadJson('data/images.json'),
    loadJson('data/playlists.json').catch(() => []),
    loadJson('data/chapters.json').catch(() => [])
  ]);

  if(!Array.isArray(cards) || cards.length < 600){
    throw new Error(`data/cards.json must contain 600 cards, actual: ${Array.isArray(cards) ? cards.length : 'not array'}`);
  }

  state.cards = mergeCardsAndImages(cards, Array.isArray(images) ? images : []);
  state.images = Array.isArray(images) ? images : [];
  state.playlists = Array.isArray(playlists) ? playlists : [];
  state.chapters = Array.isArray(chapters) ? chapters : [];
  state.currentIndex = 0;

  track('app_loaded', {
    cardCount: state.cards.length,
    imageCount: state.images.length,
    playlistCount: state.playlists.length,
    chapterCount: state.chapters.length
  });

  renderCurrentCard();
}

button.addEventListener('click', () => {
  if(state.isPlaying) stopAndRender();
  else startPlayback();
});

document.addEventListener('visibilitychange', () => {
  if(document.hidden) stopAndRender();
});

window.addEventListener('pagehide', () => {
  stopAndRender();
});

window.addEventListener('resize', () => {
  rerenderForViewport();
});

window.addEventListener('load', async () => {
  updateButton();

  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = () => {};
  }

  try{
    await loadCards();
  }catch(error){
    clearTimer();
    stopAllAudio();
    showError('600カードデータを読み込めませんでした。data/cards.json が600件あるか確認してください。');
    console.error(error);
  }
});
