const BGM_SRC = 'audio/bgm_piano.mp3';

const BGM_BASE_VOLUME = 0.01;
const BGM_IMAGE_SWITCH_VOLUME = 0.001;

const KEY = '__LINGOFLOW_BGM__';

if (!window[KEY]) {
  window[KEY] = {
    audio: null,
    initialized: false,
    userStarted: false,
    starting: false,
    quietUntil: 0,
    guardTimer: null,
    imageObserverStarted: false
  };
}

const bgm = window[KEY];

function targetVolume() {
  return Date.now() < bgm.quietUntil
    ? BGM_IMAGE_SWITCH_VOLUME
    : BGM_BASE_VOLUME;
}

function clampVolume() {
  if (!bgm.audio) return;
  const volume = targetVolume();

  if (bgm.audio.volume !== volume) {
    bgm.audio.volume = volume;
  }
}

function quietBgm(ms = 1600) {
  bgm.quietUntil = Math.max(bgm.quietUntil, Date.now() + ms);
  clampVolume();
}

export function quietBgmForTransition(ms = 1600) {
  quietBgm(ms);
}

function startGuard() {
  if (bgm.guardTimer) return;

  bgm.guardTimer = setInterval(() => {
    clampVolume();
  }, 50);
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

  const observer = new MutationObserver(() => {
    quietBgm(1800);
  });

  observer.observe(photo, {
    attributes: true,
    attributeFilter: ['src']
  });

  photo.addEventListener('load', () => {
    quietBgm(1800);
  });

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
  clampVolume();
  startGuard();
  watchImageSwitch();

  if (!bgm.initialized) {
    bgm.audio.addEventListener('volumechange', clampVolume);

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
  clampVolume();

  if (!bgm.audio.paused) return;
  if (bgm.starting) return;

  bgm.starting = true;

  try {
    await bgm.audio.play();
  } catch (error) {
  } finally {
    bgm.starting = false;
    clampVolume();
  }
}

export function stopBgm() {
  if (!bgm.audio) return;

  bgm.audio.pause();
  bgm.audio.currentTime = 0;
  bgm.starting = false;
  bgm.quietUntil = 0;
  clampVolume();
}