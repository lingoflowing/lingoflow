const cards = [
  {
    theme: "朝",
    zh: "早安",
    pinyin: "zǎo ān",
    ja: "おはよう",
    sentenceZh: "今天也早安。",
    sentencePinyin: "jīn tiān yě zǎo ān",
    sentenceJa: "今日もおはよう。"
  },
  {
    theme: "MRT",
    zh: "捷運",
    pinyin: "jié yùn",
    ja: "MRT",
    sentenceZh: "我每天坐捷運上班。",
    sentencePinyin: "wǒ měi tiān zuò jié yùn shàng bān",
    sentenceJa: "毎日MRTで通勤します。"
  },
  {
    theme: "雨",
    zh: "下雨",
    pinyin: "xià yǔ",
    ja: "雨が降る",
    sentenceZh: "今天一直下雨。",
    sentencePinyin: "jīn tiān yì zhí xià yǔ",
    sentenceJa: "今日はずっと雨です。"
  },
  {
    theme: "夜",
    zh: "晚安",
    pinyin: "wǎn ān",
    ja: "おやすみ",
    sentenceZh: "今天辛苦了，晚安。",
    sentencePinyin: "jīn tiān xīn kǔ le, wǎn ān",
    sentenceJa: "今日はお疲れさま、おやすみ。"
  },
  {
    theme: "茶",
    zh: "茶",
    pinyin: "chá",
    ja: "お茶",
    sentenceZh: "我想喝一杯茶。",
    sentencePinyin: "wǒ xiǎng hē yì bēi chá",
    sentenceJa: "お茶を一杯飲みたい。"
  }
];

const state = {
  currentIndex: 0,
  isPlaying: false,
  currentTimerId: null,
  currentUtterance: null,
  voices: []
};

const elements = {
  imageLabel: document.getElementById("imageLabel"),
  wordZh: document.getElementById("wordZh"),
  wordPinyin: document.getElementById("wordPinyin"),
  wordJa: document.getElementById("wordJa"),
  sentenceZh: document.getElementById("sentenceZh"),
  sentencePinyin: document.getElementById("sentencePinyin"),
  sentenceJa: document.getElementById("sentenceJa"),
  playButton: document.getElementById("playButton")
};

function renderCard() {
  const card = cards[state.currentIndex];

  elements.imageLabel.textContent = card.theme;
  elements.wordZh.textContent = card.zh;
  elements.wordPinyin.textContent = card.pinyin;
  elements.wordJa.textContent = card.ja;
  elements.sentenceZh.textContent = card.sentenceZh;
  elements.sentencePinyin.textContent = card.sentencePinyin;
  elements.sentenceJa.textContent = card.sentenceJa;
}

function clearCurrentTimer() {
  if (state.currentTimerId !== null) {
    window.clearTimeout(state.currentTimerId);
    state.currentTimerId = null;
  }
}

function setManagedTimeout(callback, delay) {
  clearCurrentTimer();
  state.currentTimerId = window.setTimeout(() => {
    state.currentTimerId = null;
    callback();
  }, delay);
}

function loadVoices() {
  state.voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}

function getChineseVoice() {
  const voices = state.voices;
  return (
    voices.find((voice) => voice.lang === "zh-TW") ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("zh-tw")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("zh"))
  );
}

function speakChinese(text, onEnd) {
  if (!window.speechSynthesis) {
    onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getChineseVoice();

  if (voice) {
    utterance.voice = voice;
  }

  utterance.lang = "zh-TW";
  utterance.rate = 0.86;
  utterance.pitch = 1;

  utterance.onend = () => {
    state.currentUtterance = null;
    onEnd();
  };

  utterance.onerror = () => {
    state.currentUtterance = null;
    onEnd();
  };

  state.currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopPlayback() {
  state.isPlaying = false;
  clearCurrentTimer();

  elements.playButton.textContent = "▶︎";
  elements.playButton.setAttribute("aria-label", "再生");

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  state.currentUtterance = null;
}

function moveToNextCard() {
  state.currentIndex = (state.currentIndex + 1) % cards.length;
  renderCard();
}

function playCurrentCard() {
  if (!state.isPlaying) return;

  const card = cards[state.currentIndex];

  speakChinese(card.zh, () => {
    if (!state.isPlaying) return;

    setManagedTimeout(() => {
      if (!state.isPlaying) return;

      speakChinese(card.sentenceZh, () => {
        if (!state.isPlaying) return;

        setManagedTimeout(() => {
          if (!state.isPlaying) return;
          moveToNextCard();
          playCurrentCard();
        }, 1400);
      });
    }, 700);
  });
}

function startPlayback() {
  if (state.isPlaying) return;

  state.isPlaying = true;
  elements.playButton.textContent = "■";
  elements.playButton.setAttribute("aria-label", "停止");
  playCurrentCard();
}

function togglePlayback() {
  if (state.isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

elements.playButton.addEventListener("click", togglePlayback);

window.addEventListener("beforeunload", stopPlayback);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopPlayback();
  }
});

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

renderCard();
