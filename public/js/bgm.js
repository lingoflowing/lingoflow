// LingoFlow Phase66 BGM v1
// 静かなピアノBGMを1曲固定・再生中だけ流す
// UI追加なし / 設定追加なし / iPhone向けBGM音量0.3%

const BGM_SRC = 'audio/bgm_piano.mp3';
const BGM_VOLUME = 0;

let bgmAudio = null;
let bgmUserStarted = false;

export function initBgm() {
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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopBgm();
    }
  });
}

export function markBgmUserStarted() {
  bgmUserStarted = true;
}

export async function startBgm() {
  if (!bgmAudio) initBgm();
  if (!bgmAudio) return;

  // iPhone対策：ユーザー操作後だけ再生
  if (!bgmUserStarted) return;

  bgmAudio.volume = BGM_VOLUME;
  bgmAudio.loop = true;

  if (!bgmAudio.paused) return;

  try {
    await bgmAudio.play();
  } catch (error) {
    // iPhone/Safariの自動再生ブロック時は何もしない
  }
}

export function stopBgm() {
  if (!bgmAudio) return;

  bgmAudio.pause();
  bgmAudio.currentTime = 0;
}
