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
      id: card.id || null,
      chapterNo: card.chapterNo || null,
      playlistNo: card.playlistNo || null
    });
    nextCard();
  }
}

function startPlayback(){
  if(state.isPlaying || !state.cards.length) return;

  track('play_start', { index: state.currentIndex });
  const runId = startAudioPlayback();
  updateButton();
  playLoop(runId);
}

function stopAndRender(){
  if(state.isPlaying) track('play_stop', { index: state.currentIndex });
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
    const imageMeta = imageByCardId.get(card.id) || null;
    const image = imageMeta?.imagePath || (card.imageFile ? `images/${card.imageFile}` : '');

    return {
      ...card,
      image,
      imageMeta
    };
  });
}

async function loadCards(){
  const [cards, images, playlists, chapters] = await Promise.all([
    loadJson('data/cards.json'),
    loadJson('data/images.json'),
    loadJson('data/playlists.json').catch(() => []),
    loadJson('data/chapters.json').catch(() => [])
  ]);

  if(!Array.isArray(cards) || cards.length === 0){
    throw new Error('data/cards.json is empty');
  }

  state.cards = mergeCardsAndImages(cards, Array.isArray(images) ? images : []);
  state.playlists = playlists;
  state.chapters = chapters;
  state.currentIndex = 0;

  track('app_loaded', {
    cardCount: state.cards.length,
    playlistCount: Array.isArray(playlists) ? playlists.length : 0,
    chapterCount: Array.isArray(chapters) ? chapters.length : 0
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
    showError('カードデータを読み込めませんでした。data/cards.json と data/images.json を確認してください。');
    console.error(error);
  }
});
