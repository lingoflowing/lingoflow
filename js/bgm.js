// LingoFlow Phase66 BGM Stable v2
// 静かなピアノ1曲固定・再生中だけ流れる

(function () {
  const BGM_ID = "bgmAudio";
  const BGM_VOLUME = 0.05;

  function getBgmAudio() {
    let audio = document.getElementById(BGM_ID);

    if (!audio) {
      audio = document.createElement("audio");
      audio.id = BGM_ID;
      audio.src = "audio/bgm_piano.mp3";
      audio.loop = true;
      audio.preload = "auto";
      audio.setAttribute("playsinline", "");
      document.body.appendChild(audio);
    }

    audio.volume = BGM_VOLUME;
    audio.loop = true;
    return audio;
  }

  window.startBgm = function startBgm() {
    const bgmAudio = getBgmAudio();
    bgmAudio.volume = BGM_VOLUME;

    if (!bgmAudio.paused) return;

    bgmAudio.play().catch(function () {
      // iPhone/Safariなどでユーザー操作外と判断された場合は無視。
      // 既存の再生ボタン内から呼べば基本的に再生される。
    });
  };

  window.stopBgm = function stopBgm() {
    const bgmAudio = document.getElementById(BGM_ID);
    if (!bgmAudio) return;

    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  };

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && typeof window.stopBgm === "function") {
      window.stopBgm();
    }
  });
})();
