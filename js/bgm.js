const BGM_SRC = 'audio/bgm_piano.mp3';
const BGM_VOLUME = 0.01;

const KEY = '__LINGOFLOW_BGM__';

if (!window[KEY]) {
  window[KEY] = {
    audio: null,
    initialized: false,
    userStarted: false,
    starting: false
  };
}

const bgm = window[KEY];

function clampVolume() {
  if (!bgm.audio) return;
  if (bgm.audio.volume !== BGM_VOLUME) {
    bgm.audio.volume = BGM_VOLUME;
  }
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
  bgm.audio.volume = BGM_VOLUME;

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
    clampVolume();
    await bgm.audio.play();
    clampVolume();
  } catch (error) {
    // iPhone / Safari の自動再生制限時は無視
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
  clampVolume();
}