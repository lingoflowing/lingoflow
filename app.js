const cards=[
{img:'images/morning.jpg',imgPortrait:'images/portrait/morning.jpg',lines:['早安','今天也早安。']},
{img:'images/mrt.jpg',imgPortrait:'images/portrait/mrt.jpg',lines:['捷運','我搭捷運去上班。']},
{img:'images/rain.jpg',imgPortrait:'images/portrait/rain.jpg',lines:['下雨','今天下雨了，記得帶傘。']},
{img:'images/night.jpg',imgPortrait:'images/portrait/night.jpg',lines:['夜','夜晚的台北很漂亮。']},
{img:'images/tea.jpg',imgPortrait:'images/portrait/tea.jpg',lines:['茶','我喜歡喝茶。']}
];

const state={
  index:0,
  isPlaying:false,
  timerId:null,
  runId:0
};

const photo=document.getElementById('photo');
const button=document.getElementById('playStopButton');
const icon=document.getElementById('playStopIcon');

const PLAY_SVG = `
  <svg class="play-svg" viewBox="0 0 48 48" focusable="false" aria-hidden="true">
    <path d="M11 8 L37 24 L11 40 Z"></path>
  </svg>
`;

const STOP_SVG = `
  <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
    <rect x="10" y="10" width="28" height="28" rx="4.5" ry="4.5"></rect>
  </svg>
`;


function zhVoice(){
 const voices=speechSynthesis.getVoices();
 return voices.find(v=>v.lang==='zh-TW')
 || voices.find(v=>v.lang.toLowerCase().startsWith('zh'));
}

function usePortraitImage(){
  return window.matchMedia('(orientation: portrait) and (max-width: 700px)').matches;
}

function currentImage(card){
  return usePortraitImage() && card.imgPortrait ? card.imgPortrait : card.img;
}

function renderCurrentCard(){
  const c=cards[state.index];
  photo.src=currentImage(c);
}

function updateButton(){
  button.classList.toggle('is-playing',state.isPlaying);
  icon.innerHTML = state.isPlaying ? STOP_SVG : PLAY_SVG;
  button.setAttribute('aria-label',state.isPlaying?'停止':'再生');
}

function clearTimer(){
  if(state.timerId){
    clearTimeout(state.timerId);
    state.timerId=null;
  }
}

function stopAll(){
  state.isPlaying=false;
  state.runId++;
  clearTimer();
  speechSynthesis.cancel();
  updateButton();
}

function wait(ms,runId){
 return new Promise(resolve=>{
   clearTimer();
   state.timerId=setTimeout(()=>{
     state.timerId=null;
     resolve();
   },ms);
 });
}

function speak(text,runId){
 return new Promise(resolve=>{
   if(!state.isPlaying || runId!==state.runId) return resolve();
   speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(text);
   u.lang='zh-TW';
   const v=zhVoice();
   if(v) u.voice=v;
   u.rate=.88;
   u.pitch=1;
   u.onend=()=>resolve();
   u.onerror=()=>resolve();
   speechSynthesis.speak(u);
 });
}

async function loop(runId){
 while(state.isPlaying && runId===state.runId){
   const c=cards[state.index];
   renderCurrentCard();

   await wait(900,runId);
   if(!state.isPlaying || runId!==state.runId) break;

   for(const line of c.lines){
      await speak(line,runId);
      if(!state.isPlaying || runId!==state.runId) break;
      await wait(700,runId);
   }

   if(!state.isPlaying || runId!==state.runId) break;
   await wait(1800,runId);
   if(!state.isPlaying || runId!==state.runId) break;
   state.index=(state.index+1)%cards.length;
 }
}

function start(){
  if(state.isPlaying) return;
  state.isPlaying=true;
  state.runId++;
  updateButton();
  loop(state.runId);
}

button.addEventListener('click',()=>{
  if(state.isPlaying) stopAll();
  else start();
});

window.addEventListener('load',()=>{
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged=()=>{};
  }
  renderCurrentCard();
  updateButton();
});

document.addEventListener('visibilitychange',()=>{
 if(document.hidden) stopAll();
});

window.addEventListener('resize',()=>{
  renderCurrentCard();
});
