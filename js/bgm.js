/* LingoFlow Phase66 BGM Stable Fix v3
   - Keep audio.js as main voice controller
   - This file only manages background piano BGM
   - Exposes functions to window so audio.js/app.js can call them safely
*/
(function () {
  const BGM_ID = 'bgmAudio';
  const BGM_SRC = 'audio/bgm_piano.mp3';
  const BGM_VOLUME = 0.05;

  let bgmAudio = null;
  let bgmUnlocked = false;

  function ensureBgmAudio() {
    bgmAudio = document.getElementById(BGM_ID);

    if (!bgmAudio) {
      bgmAudio = document.createElement('audio');
      bgmAudio.id = BGM_ID;
      bgmAudio.src = BGM_SRC;
      bgmAudio.preload = 'auto';
      bgmAudio.loop = true;
      bgmAudio.playsInline = true;
      document.body.appendChild(bgmAudio);
    }

    bgmAudio.loop = true;
    bgmAudio.volume = BGM_VOLUME;
    return bgmAudio;
  }

  async function unlockBgm() {
    const audio = ensureBgmAudio();
    try {
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = BGM_VOLUME;
      bgmUnlocked = true;
      console.log('[BGM] unlocked');
    } catch (error) {
      console.warn('[BGM] unlock failed:', error);
    }
  }

  async function startBgm() {
    const audio = ensureBgmAudio();
    try {
      audio.volume = BGM_VOLUME;
      audio.loop = true;
      if (audio.paused) {
        await audio.play();
      }
      console.log('[BGM] started');
    } catch (error) {
      console.warn('[BGM] start failed:', error);
    }
  }

  function stopBgm() {
    const audio = ensureBgmAudio();
    try {
      audio.pause();
      audio.currentTime = 0;
      console.log('[BGM] stopped');
    } catch (error) {
      console.warn('[BGM] stop failed:', error);
    }
  }

  function pauseBgm() {
    const audio = ensureBgmAudio();
    try {
      audio.pause();
      console.log('[BGM] paused');
    } catch (error) {
      console.warn('[BGM] pause failed:', error);
    }
  }

  // Expose globally. This is important when audio.js is not an ES module.
  window.ensureBgmAudio = ensureBgmAudio;
  window.unlockBgm = unlockBgm;
  window.startBgm = startBgm;
  window.stopBgm = stopBgm;
  window.pauseBgm = pauseBgm;

  document.addEventListener('DOMContentLoaded', ensureBgmAudio);

  // iPhone/Safari: unlock must happen after a real user gesture.
  ['pointerdown', 'touchstart', 'click'].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      if (!bgmUnlocked) unlockBgm();
    }, { once: false, passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopBgm();
  });
})();
