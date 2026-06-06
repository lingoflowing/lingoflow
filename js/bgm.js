const BGM_SRC = 'audio/bgm_piano.mp3';
const BGM_VOLUME = 0.01;

let bgmAudio = null;
let bgmUserStarted = false;
let bgmStarting = false;
let bgmInitialized = false;
let volumeGuardTimer = null;

function clampBgmVolume() {
  if (!bgmAudio) return;
  if (bgmAudio.volume !== BGM_VOLUME) {
    bgmAudio.volume = BGM_VOLUME;
  }
}

function startVolumeGuard() {
  if (volumeGuardTimer) return;
  volumeGuardTimer = setInterval(clampBgmVolume, 300);
}

function stopVolumeGuard() {
  if (!volumeGuardTimer) return;
  clearInterval(volumeGuardTimer);
  volumeGuardTimer = null;
}

export function initBgm() {
  if (bgmInitialized && bgmAudio) return;

  bgmAudio = document.getElementById('bgmAudio');

  if (!bgmAudio) {
    bgmAudio = document.createElement('audio');
    bgmAudio.id = 'bgmAudio';
    bgmAudio.src = BGM_SRC;
    bgmAudio.preload = 'auto';
    bgmAudio.loop = true;
    bgmAudio.setAttribute('playsinline', '');
    document.body.appendChild(bgmAudio);
  }

  bgmAudio.loop = true;
  bgmAudio.volume = BGM_VOLUME;

  bgmAudio.addEventListener('volumechange', clampBgmVolume);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopBgm();
  });

  bgmInitialized = true;
}

export function markBgmUserStarted() {
  bgmUserStarted = true;
}

export async function startBgm() {
  if (!bgmAudio) initBgm();
  if (!bgmAudio) return;
  if (!bgmUserStarted) return;

  clampBgmVolume();
  startVolumeGuard();

  if (!bgmAudio.paused) return;
  if (bgmStarting) return;

  bgmStarting = true;

  try {
    clampBgmVolume();
    await bgmAudio.play();
    clampBgmVolume();
  } catch (error) {
  } finally {
    bgmStarting = false;
    clampBgmVolume();
  }
}

export function stopBgm() {
  if (!bgmAudio) return;

  bgmAudio.pause();
  bgmAudio.currentTime = 0;
  bgmStarting = false;
  clampBgmVolume();
  stopVolumeGuard();
}