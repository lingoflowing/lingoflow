// Kotoba Biyori phase127-render-cache-bust-20260629
// iPhone音声安定化のため、BGMを完全停止するリセット版。
// ここではBGM用audioを作らず、既存のBGM audioがあれば停止する。

function stopExistingBgmElements(){
  document.querySelectorAll('audio').forEach(audio => {
    const key = `${audio.id || ''} ${audio.className || ''} ${audio.src || ''}`.toLowerCase();
    if(key.includes('bgm') || key.includes('music') || key.includes('piano')){
      try{
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        audio.muted = true;
        audio.src = '';
        audio.removeAttribute('src');
        audio.load?.();
      }catch(_error){}
    }
  });
}

export function initBgm(){
  stopExistingBgmElements();
}

export function markBgmUserStarted(){
  stopExistingBgmElements();
}

export async function startBgm(){
  stopExistingBgmElements();
}

export function stopBgm(){
  stopExistingBgmElements();
}
