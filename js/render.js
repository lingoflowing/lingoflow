const el = {
  card: document.getElementById('card'),
  image: document.getElementById('cardImage'),
  wordZh: document.getElementById('wordZh'),
  wordPinyin: document.getElementById('wordPinyin'),
  wordJa: document.getElementById('wordJa'),
  sentenceZh: document.getElementById('sentenceZh'),
  sentencePinyin: document.getElementById('sentencePinyin'),
  sentenceJa: document.getElementById('sentenceJa'),
  playButton: document.getElementById('playButton'),
  statusText: document.getElementById('statusText'),
};

export function renderCard(card) {
  if (!card) {
    setStatus('カードを読み込めませんでした');
    return;
  }

  el.image.src = card.image || '';
  el.image.alt = card.ja || card.zh || '';
  el.wordZh.textContent = card.zh || '';
  el.wordPinyin.textContent = card.pinyin || '';
  el.wordJa.textContent = card.ja || '';
  el.sentenceZh.textContent = card.sentence_zh || '';
  el.sentencePinyin.textContent = card.sentence_pinyin || '';
  el.sentenceJa.textContent = card.sentence_ja || '';
}

export function setPlayingUI(isPlaying) {
  el.playButton.textContent = isPlaying ? 'Ⅱ' : '▶︎';
  el.playButton.setAttribute('aria-label', isPlaying ? '停止' : '再生');
  el.playButton.classList.toggle('is-playing', isPlaying);
  setStatus(isPlaying ? '静かに再生中' : '停止中');
}

export function setStatus(text) {
  el.statusText.textContent = text || '';
}

export function bindPlayButton(handler) {
  el.playButton.addEventListener('click', handler);
}

export async function fadeCard(callback) {
  el.card.classList.add('is-fading');
  await wait(420);
  callback();
  el.card.classList.remove('is-fading');
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
