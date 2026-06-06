const BGM_SRC = 'audio/bgm_piano.mp3';

const BGM_BASE_VOLUME = 0.003;

const KEY = '__LINGOFLOW_BGM__';

if (!window[KEY]) {
  window[KEY] = {
    audio: null,
    initialized: false,
    userStarted: false,
    starting: false,
    hardMuted: false,
    releaseTimer: null,
    guardTimer: null
  };
}

const bgm = window[KEY];

function applyVolume() {
  if (!bgm.audio) return;

  if (bgm.hardMuted) {
    bgm.audio.muted = true;
    bgm.audio.volume = 0;
  } else {
    bgm.audio.muted = false;
    bgm.audio.volume = BGM_BASE_VOLUME;
  }
}

function startGuard() {
  if (bgm.guardTimer) return;

  bgm.guardTimer = setInterval(() => {
    applyVolume();
  }, 30);
}

export function hardMuteBgm() {
  bgm.hardMuted = true;

  if (bgm.releaseTimer) {
    clearTimeout(bgm.releaseTimer);
    bgm.releaseTimer = null;
  }

  applyVolume();
}

export function releaseBgmAfter(ms = 1500) {
  if (bgm.releaseTimer) {
    clearTimeout(bgm.releaseTimer);
  }

  bgm.releaseTimer = setTimeout(() => {
    bgm.hardMuted = false;
    bgm.releaseTimer = null;
    applyVolume();
  }, ms);
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
  applyVolume();
  startGuard();

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
  bgm.hardMuted = false;

  if (bgm.releaseTimer) {
    clearTimeout(bgm.releaseTimer);
    bgm.releaseTimer = null;
  }

  applyVolume();
}