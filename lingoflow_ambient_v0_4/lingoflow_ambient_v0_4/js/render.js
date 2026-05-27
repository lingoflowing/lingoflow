const themeClassMap = {
  coffee: 'visual-coffee',
  rain: 'visual-rain',
  mrt: 'visual-mrt',
  night: 'visual-night',
  store: 'visual-store',
  food: 'visual-food',
  slow: 'visual-slow',
  morning: 'visual-morning',
  tea: 'visual-tea',
  home: 'visual-home',
};

export const dom = {
  card: document.getElementById('card'),
  visual: document.getElementById('visual'),
  wordZh: document.getElementById('wordZh'),
  wordPinyin: document.getElementById('wordPinyin'),
  wordJa: document.getElementById('wordJa'),
  sentenceZh: document.getElementById('sentenceZh'),
  sentencePinyin: document.getElementById('sentencePinyin'),
  sentenceJa: document.getElementById('sentenceJa'),
  playButton: document.getElementById('playButton'),
  playIcon: document.getElementById('playIcon'),
};

export function renderCard(card) {
  if (!card) return;

  dom.wordZh.textContent = card.zh;
  dom.wordPinyin.textContent = card.pinyin;
  dom.wordJa.textContent = card.ja;
  dom.sentenceZh.textContent = card.sentence_zh;
  dom.sentencePinyin.textContent = card.sentence_pinyin;
  dom.sentenceJa.textContent = card.sentence_ja;

  const visualClass = themeClassMap[card.theme] || 'visual-coffee';
  dom.visual.className = `visual ${visualClass}`;
  dom.visual.innerHTML = '<div class="visual-mark"></div>';
}

export function renderButton(isPlaying) {
  dom.playIcon.textContent = isPlaying ? 'Ⅱ' : '▶︎';
  dom.playButton.setAttribute('aria-label', isPlaying ? '停止' : '再生');
}

export async function fadeToCard(card) {
  dom.card.classList.add('is-fading');
  await new Promise(resolve => window.setTimeout(resolve, 180));
  renderCard(card);
  dom.card.classList.remove('is-fading');
}

export function renderError(message) {
  dom.wordZh.textContent = 'LingoFlow';
  dom.wordPinyin.textContent = '';
  dom.wordJa.textContent = message;
  dom.sentenceZh.textContent = '';
  dom.sentencePinyin.textContent = '';
  dom.sentenceJa.textContent = '';
}
