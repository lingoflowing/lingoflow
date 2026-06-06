// LingoFlow BGM
// BGMは1つだけ生成
// 音量は常に1%固定
// 画像切り替え時の多重再生を防止

const BGM_SRC = 'audio/bgm_piano.mp3';
const BGM_VOLUME = 0.01;

let bgmAudio = null;
let bgmUserStarted = false;
let bgmStarting = false;
let bgmInitialized = false;

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

  bgmAudio.volume = BGM_VOLUME;
  bgmAudio.loop = true;

  bgmAudio.addEventListener('volumechange', () => {
    if (bgmAudio && bgmAudio.volume > BGM_VOLUME) {
      bgmAudio.volume = BGM_VOLUME;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopBgm();
    }
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

  bgmAudio.volume = BGM_VOLUME;
  bgmAudio.loop = true;

  if (!bgmAudio.paused) return;
  if (bgmStarting) return;

  bgmStarting = true;

  try {
    await bgmAudio.play();
  } catch (error) {
    // iPhone/Safariの自動再生ブロック時は何もしない
  } finally {
    bgmStarting = false;
    if (bgmAudio) {
      bgmAudio.volume = BGM_VOLUME;
    }
  }
}

export function stopBgm() {
  if (!bgmAudio) return;

  bgmAudio.pause();
  bgmAudio.currentTime = 0;
  bgmAudio.volume = BGM_VOLUME;
  bgmStarting = false;
}