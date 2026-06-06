const BGM_SRC = 'audio/bgm_piano.mp3';

const BGM_BASE_VOLUME = 0.003;
const BGM_MUTED_VOLUME = 0;

const KEY = '__LINGOFLOW_BGM__';

if (!window[KEY]) {
  window[KEY] = {
    audio: null,
    initialized: false,
    userStarted: false,
    starting: false,
    mutedUntil: 0,
    guardTimer: null,
    imageObserverStarted: false
  };
}

const bgm = window[KEY];

function targetVolume() {
  return Date.now() < bgm.mutedUntil
    ? BGM_MUTED_VOLUME
    : BGM_BASE_VOLUME;
}

function applyVolume() {
  if (!bgm.audio) return;
  bgm.audio.volume = targetVolume();
}

function muteBgmTemporarily(ms = 2200) {
  bgm.mutedUntil = Math.max(bgm.mutedUntil, Date.now() + ms);
  applyVolume();
}

export function quietBgmForTransition(ms = 2200) {
  muteBgmTemporarily(ms);
}

function startGuard() {
  if (bgm.guardTimer) return;

  bgm.guardTimer = setInterval(() => {
    applyVolume();
  }, 30);
}

function removeDuplicateBgmAudio() {
  const nodes = Array.from(document.querySelectorAll('audio#bgmAudio'));

  nodes.forEach((node, index) => {
    if (index > 0) {
      node.pause();
      node.remove();
    }
  });
}

function watchImageSwitch() {
  if (bgm.imageObserverStarted) return;

  const photo = document.getElementById('photo');
  if (!photo) return;

  const mute = () => {
    muteBgmTemporarily(2400);
  };

  const observer = new MutationObserver(mute);

  observer.observe(photo, {
    attributes: true,
    attributeFilter: ['src']
  });

  photo.addEventListener('load', mute);
  photo.addEventListener('loadstart', mute);

  bgm.imageObserverStarted = true;
}

export function initBgm() {
  removeDuplicateBgmAudio();

  if (!bgm.audio) {
    bgm.audio = document.getElementById('bgmAudio');

    if (!bgm.audio) {
      bgm.audio = document.createElement('audio');
      bgm.audio.id = 'bgmAudio';
      bgm.audio.src = BGM_SRC;
      bgm.audio.preload = 'auto';
      bgm.audio.loop = true;
      bgm.audio.setAttribute('playsinline', '');
      document.body.appendChild(bgm.audio);
    }
  }

  bgm.audio.loop = true;
  applyVolume();
  startGuard();
  watchImageSwitch();

  if (!bgm.initialized) {
    bgm.audio.addEventListener('volumechange', applyVolume);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopBgm();
      }
    });

    bgm.initialized = true;
  }
}

export function markBgmUserStarted() {
  bgm.userStarted = true;
}

export async function startBgm() {
  initBgm();

  if (!bgm.audio) return;
  if (!bgm.userStarted) return;

  removeDuplicateBgmAudio();
  applyVolume();

  if (!bgm.audio.paused) return;
  if (bgm.starting) return;

  bgm.starting = true;

  try {
    await bgm.audio.play();
  } catch (error) {
  } finally {
    bgm.starting = false;
    applyVolume();
  }
}

export function stopBgm() {
  if (!bgm.audio) return;

  bgm.audio.pause();
  bgm.audio.currentTime = 0;
  bgm.starting = false;
  bgm.mutedUntil = 0;
  applyVolume();
}