const BGM_SRC = 'audio/bgm_piano.mp3';

const BGM_BASE_VOLUME = 0.01;
const BGM_TRANSITION_VOLUME = 0.002;

const KEY = '__LINGOFLOW_BGM__';

if (!window[KEY]) {
  window[KEY] = {
    audio: null,
    initialized: false,
    userStarted: false,
    starting: false,
    transitionUntil: 0,
    guardTimer: null
  };
}

const bgm = window[KEY];

function targetVolume() {
  return Date.now() < bgm.transitionUntil
    ? BGM_TRANSITION_VOLUME
    : BGM_BASE_VOLUME;
}

function clampVolume() {
  if (!bgm.audio) return;

  const target = targetVolume();

  if (bgm.audio.volume !== target) {
    bgm.audio.volume = target;
  }
}

function startGuard() {
  if (bgm.guardTimer) return;

  bgm.guardTimer = setInterval(() => {
    clampVolume();
  }, 100);
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

export function quietBgmForTransition(ms = 900) {
  bgm.transitionUntil = Date.now() + ms;
  clampVolume();
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
    clampVolume();
    await bgm.audio.play();
    clampVolume();
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
  bgm.transitionUntil = 0;
  clampVolume();
}