
function getCardImagePath(card) {
  return card.imageFile || card.image || card.imagePath || card.img || "";
}

function getWordZh(card) {
  return card.wordZh || card.zh || card.word || card.word_zh || "";
}

function getWordPinyin(card) {
  return card.wordPinyin || card.pinyin || card.word_pinyin || "";
}

function getWordJa(card) {
  return card.wordJa || card.ja || card.word_ja || card.meaning || "";
}

function getSentenceZh(card) {
  return card.sentenceZh || card.sentence_zh || card.exampleZh || card.example_zh || card.example || "";
}

function getSentencePinyin(card) {
  return card.sentencePinyin || card.sentence_pinyin || card.examplePinyin || card.example_pinyin || "";
}

function getSentenceJa(card) {
  return card.sentenceJa || card.sentence_ja || card.exampleJa || card.example_ja || card.translation || "";
}

function setTextById(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function setTextBySelector(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value || "";
}

function setImage(card) {
  const src = getCardImagePath(card);
  const candidates = [
    document.getElementById("cardImage"),
    document.getElementById("image"),
    document.getElementById("mainImage"),
    document.querySelector(".card-image"),
    document.querySelector(".image-area img"),
    document.querySelector(".imageOnly img"),
    document.querySelector("img")
  ].filter(Boolean);

  const img = candidates[0];
  if (img) {
    img.src = src;
    img.alt = getWordJa(card) || getWordZh(card) || "";
  }
}

function renderCard(card) {
  if (!card) return;

  setImage(card);

  const wordZh = getWordZh(card);
  const wordPinyin = getWordPinyin(card);
  const wordJa = getWordJa(card);
  const sentenceZh = getSentenceZh(card);
  const sentencePinyin = getSentencePinyin(card);
  const sentenceJa = getSentenceJa(card);

  // Common IDs
  setTextById("wordZh", wordZh);
  setTextById("wordPinyin", wordPinyin);
  setTextById("wordJa", wordJa);
  setTextById("sentenceZh", sentenceZh);
  setTextById("sentencePinyin", sentencePinyin);
  setTextById("sentenceJa", sentenceJa);

  setTextById("zh", wordZh);
  setTextById("pinyin", wordPinyin);
  setTextById("ja", wordJa);
  setTextById("sentence_zh", sentenceZh);
  setTextById("sentence_pinyin", sentencePinyin);
  setTextById("sentence_ja", sentenceJa);

  // Common classes
  setTextBySelector(".word-zh", wordZh);
  setTextBySelector(".word-pinyin", wordPinyin);
  setTextBySelector(".word-ja", wordJa);
  setTextBySelector(".sentence-zh", sentenceZh);
  setTextBySelector(".sentence-pinyin", sentencePinyin);
  setTextBySelector(".sentence-ja", sentenceJa);

  setTextBySelector(".zh", wordZh);
  setTextBySelector(".pinyin", wordPinyin);
  setTextBySelector(".ja", wordJa);

  // If Phase48 has image-only UI with hidden text containers, force show if present.
  document.querySelectorAll(".word-block, .sentence-block, .text-area, .card-text, .content-text").forEach(el => {
    el.hidden = false;
    el.style.display = "";
    el.style.visibility = "visible";
    el.style.opacity = "1";
  });

  const shell = document.querySelector(".card-shell, .card, .app");
  if (shell) {
    shell.classList.remove("image-only");
    shell.classList.add("has-text");
  }

  if (typeof track === "function") {
    try { track("card_view", { id: card.id, wordZh }); } catch (e) {}
  }
}

// Compatibility aliases possibly used by app.js
function renderCurrentCard() {
  if (typeof state !== "undefined" && state.cards) {
    const index = state.currentIndex || 0;
    renderCard(state.cards[index]);
  }
}

function render() {
  if (arguments.length > 0) {
    renderCard(arguments[0]);
  } else {
    renderCurrentCard();
  }
}

function updateView(card) {
  renderCard(card);
}

function showCard(card) {
  renderCard(card);
}

window.renderCard = renderCard;
window.renderCurrentCard = renderCurrentCard;
window.render = render;
window.updateView = updateView;
window.showCard = showCard;
