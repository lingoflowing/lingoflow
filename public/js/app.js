import { state, getCurrentCard, nextCard } from './state.js?v=phase125-display-safe';
import { renderCurrentCard, rerenderForViewport, showError } from './render.js?v=phase125-display-safe';
import { clearTimer } from './timer.js?v=phase125-display-safe';
import {
  playCardZhAudio,
  speakSilent,
  startPlayback as startAudioPlayback,
  stopPlayback,
  stopAllAudio
} from './audio.js?v=phase125-display-safe';
import { PLAY_SVG, STOP_SVG } from './icons.js?v=phase125-display-safe';
import { track } from './analytics.js?v=phase125-display-safe';

const button = document.getElementById('playStopButton');
const icon = document.getElementById('playStopIcon');
const PLAYLIST_SIZE = 20;
const PLAYLIST_COUNT = 30;

// Slow calm playback pacing.
// Keep the silent TTS gaps so BGM does not come forward between spoken lines.
// This keeps one card cycle long enough to feel unhurried and contemplative.
const CARD_SETTLE_BEFORE_WORD_MS = 2000;
const PAUSE_AFTER_TEXT_MS = 1350;
const PAUSE_AFTER_CARD_MS = 3800;

function updateButton(){
  button.classList.toggle('is-playing', state.isPlaying);
  icon.innerHTML = state.isPlaying ? STOP_SVG : PLAY_SVG;
  button.setAttribute('aria-label', state.isPlaying ? '停止' : '再生');
}

async function playLoop(runId){
  while(state.isPlaying && runId === state.runId){
    const card = getCurrentCard();
    if(!card) break;

    renderCurrentCard();

    track('card_view', {
      index: state.currentIndex,
      weeklyTotal: state.cards.length,
      allTotal: state.allCards.length,
      id: card.id || null,
      chapterNo: card.chapterNo || null,
      playlistNo: card.playlistNo || null,
      weekKey: state.weeklyInfo?.weekKey || null
    });

    await speakSilent(CARD_SETTLE_BEFORE_WORD_MS, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    // playCardZhAudio waits for the card MP3 and a short voice-only gap.
    // BGM is disabled in this reset patch to stabilize iPhone narration.
    await playCardZhAudio(card, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    await speakSilent(PAUSE_AFTER_TEXT_MS, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    await speakSilent(PAUSE_AFTER_CARD_MS, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    track('card_complete', {
      index: state.currentIndex,
      weeklyTotal: state.cards.length,
      allTotal: state.allCards.length,
      id: card.id || null,
      chapterNo: card.chapterNo || null,
      playlistNo: card.playlistNo || null,
      weekKey: state.weeklyInfo?.weekKey || null
    });

    nextCard();
  }
}

function startPlayback(){
  if(state.isPlaying || !state.cards.length) return;

  track('play_start', {
    index: state.currentIndex,
    weeklyTotal: state.cards.length,
    playlistNo: state.activePlaylist?.playlistNo || null
  });

  const runId = startAudioPlayback();
  updateButton();
  playLoop(runId);
}

function stopAndRender(){
  if(state.isPlaying){
    track('play_stop', {
      index: state.currentIndex,
      weeklyTotal: state.cards.length,
      playlistNo: state.activePlaylist?.playlistNo || null
    });
  }

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

function startOfWeekLocal(date){
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekIndexSinceBase(date){
  const baseMonday = new Date(2026, 5, 8);
  const currentMonday = startOfWeekLocal(date);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((currentMonday - baseMonday) / msPerWeek);
}

function selectWeeklyPlaylist(allCards, playlists, chapters){
  const weekIndex = weekIndexSinceBase(new Date());
  const normalizedIndex = ((weekIndex % PLAYLIST_COUNT) + PLAYLIST_COUNT) % PLAYLIST_COUNT;
  const playlistNo = String(normalizedIndex + 1).padStart(3, '0');

  let weeklyCards = allCards
    .filter(card => String(card.playlistNo).padStart(3, '0') === playlistNo)
    .sort((a, b) => Number(a.cardNo || 0) - Number(b.cardNo || 0));

  if(weeklyCards.length !== PLAYLIST_SIZE){
    const start = normalizedIndex * PLAYLIST_SIZE;
    weeklyCards = allCards
      .slice(start, start + PLAYLIST_SIZE)
      .sort((a, b) => Number(a.cardNo || 0) - Number(b.cardNo || 0));
  }

  const firstCard = weeklyCards[0] || null;

  const playlist = playlists.find(item => String(item.playlistNo).padStart(3, '0') === playlistNo)
    || { playlistNo, title: firstCard?.playlistTitle || `Playlist ${playlistNo}`, chapterNo: firstCard?.chapterNo || null };

  const chapterNo = playlist.chapterNo || firstCard?.chapterNo || null;

  const chapter = chapters.find(item => String(item.chapterNo).padStart(2, '0') === String(chapterNo).padStart(2, '0'))
    || { chapterNo, title: firstCard?.chapterTitle || '' };

  const monday = startOfWeekLocal(new Date());
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weeklyCards,
    playlist,
    chapter,
    weeklyInfo: {
      weekIndex,
      playlistNo,
      weekKey: monday.toISOString().slice(0, 10),
      startDate: monday.toISOString().slice(0, 10),
      endDate: sunday.toISOString().slice(0, 10),
      size: weeklyCards.length
    }
  };
}

async function loadCards(){
  const [cards, images, playlists, chapters] = await Promise.all([
    loadJson('data/cards.json'),
    loadJson('data/images.json'),
    loadJson('data/playlists.json').catch(() => []),
    loadJson('data/chapters.json').catch(() => [])
  ]);

  if(!Array.isArray(cards) || cards.length < 600){
    throw new Error(`data/cards.json must contain 600 cards, actual: ${Array.isArray(cards) ? cards.length : 'not array'}`);
  }

  const allCards = mergeCardsAndImages(cards, Array.isArray(images) ? images : []);
  const weekly = selectWeeklyPlaylist(allCards, Array.isArray(playlists) ? playlists : [], Array.isArray(chapters) ? chapters : []);

  if(!weekly.weeklyCards.length){
    throw new Error('weekly playlist has no cards');
  }

  state.allCards = allCards;
  state.cards = weekly.weeklyCards;
  state.images = Array.isArray(images) ? images : [];
  state.playlists = Array.isArray(playlists) ? playlists : [];
  state.chapters = Array.isArray(chapters) ? chapters : [];
  state.activePlaylist = weekly.playlist;
  state.activeChapter = weekly.chapter;
  state.weeklyInfo = weekly.weeklyInfo;

  // Always start from the first card when the page is opened.
  state.currentIndex = 0;

  track('app_loaded', {
    allCardCount: state.allCards.length,
    weeklyCardCount: state.cards.length,
    imageCount: state.images.length,
    playlistCount: state.playlists.length,
    chapterCount: state.chapters.length,
    activePlaylistNo: state.activePlaylist?.playlistNo || null,
    activePlaylistTitle: state.activePlaylist?.title || null,
    activeChapterNo: state.activeChapter?.chapterNo || null,
    activeChapterTitle: state.activeChapter?.title || null,
    weekKey: state.weeklyInfo?.weekKey || null
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

let hasBootstrapped = false;

async function bootstrap(){
  if(hasBootstrapped){
    return;
  }

  hasBootstrapped = true;
  updateButton();

  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = () => {};
  }

  try{
    await loadCards();
  }catch(error){
    clearTimer();
    stopAllAudio();
    showError('週替わりプレイリストを読み込めませんでした。data/cards.json / data/images.json の配置を確認してください。');
    console.error(error);
  }
}

if(document.readyState === 'loading'){
  window.addEventListener('DOMContentLoaded', bootstrap, { once: true });
}else{
  bootstrap();
}
