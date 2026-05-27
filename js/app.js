
let current=0;
let scenes=[];

async function init(){
 const res = await fetch('./data.json');
 scenes = await res.json();
 render();
 document.getElementById('nextBtn').addEventListener('click',nextScene);
 setInterval(nextScene,9000);
}

function render(){
 const s=scenes[current];
 document.getElementById('img').src=s.image;
 document.getElementById('zh').textContent=s.zh;
 document.getElementById('py').textContent=s.pinyin;
 document.getElementById('ja').textContent=s.ja;
}

function nextScene(){
 current=(current+1)%scenes.length;
 render();
}

init();
