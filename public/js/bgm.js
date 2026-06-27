// Phase122 iPhone stable audio patch
// BGM is intentionally disabled.
// This is a recovery baseline: restore iPhone narration reliability first,
// then reintroduce BGM later at a very low level if needed.

let bgmAudio = null;
let bgmUserStarted = false;

export function initBgm() {
  bgmAudio = document.getElementById('bgmAudio');

  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.volume = 0;
    bgmAudio.loop = false;
  }
}

export function markBgmUserStarted() {
  bgmUserStarted = true;
}

export async function startBgm() {
  if (!bgmAudio) initBgm();
  if (!bgmAudio) return;

  bgmAudio.pause();
  bgmAudio.volume = 0;
}

export function stopBgm() {
  if (!bgmAudio) return;

  bgmAudio.pause();
  bgmAudio.currentTime = 0;
  bgmAudio.volume = 0;
}
