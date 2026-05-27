
let current = 0;
let cards = [];
let timer = null;

async function init(){
  const res = await fetch('./data.json');
  cards = await res.json();

  render();

  document.getElementById('nextBtn').addEventListener('click', () => {
    next();
    restartTimer();
  });

  document.addEventListener('visibilitychange', () => {
    if(document.hidden){
      clearTimeout(timer);
    }else{
      restartTimer();
    }
  });

  restartTimer();
}

function render(){
  const c = cards[current];

  document.getElementById('sceneImage').src = c.image;
  document.getElementById('sceneLabel').textContent = c.scene;
  document.getElementById('zh').textContent = c.zh;
  document.getElementById('pinyin').textContent = c.pinyin;
  document.getElementById('ja').textContent = c.ja;
}

function next(){
  current = (current + 1) % cards.length;
  render();
}

function restartTimer(){
  clearTimeout(timer);
  timer = setTimeout(() => {
    next();
    restartTimer();
  }, 9500);
}

init();
