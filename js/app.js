
const state = {
  currentIndex: 0,
  cards: [],
  timer: null
};

const $ = (id) => document.getElementById(id);

async function init(){
  const res = await fetch("./data.json");
  state.cards = await res.json();
  render();

  $("nextBtn").addEventListener("click", () => {
    stopTimer();
    next();
    startTimer();
  });

  document.addEventListener("visibilitychange", () => {
    if(document.hidden){
      stopTimer();
    }else{
      startTimer();
    }
  });

  startTimer();
}

function render(){
  const card = state.cards[state.currentIndex];
  const visual = $("visual");

  visual.className = "visual " + card.scene;
  $("label").textContent = card.label;
  $("zh").textContent = card.zh;
  $("pinyin").textContent = card.pinyin;
  $("ja").textContent = card.ja;
}

function next(){
  state.currentIndex = (state.currentIndex + 1) % state.cards.length;
  render();
}

function startTimer(){
  stopTimer();
  state.timer = setTimeout(() => {
    next();
    startTimer();
  }, 9500);
}

function stopTimer(){
  if(state.timer){
    clearTimeout(state.timer);
    state.timer = null;
  }
}

init();
