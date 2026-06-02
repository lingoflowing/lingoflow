const cards=[
{img:'images/morning.jpg',lines:['早安','今天也早安。']},
{img:'images/mrt.jpg',lines:['捷運','我搭捷運去上班。']},
{img:'images/rain.jpg',lines:['下雨','今天下雨了，記得帶傘。']},
{img:'images/night.jpg',lines:['夜','夜晚的台北很漂亮。']},
{img:'images/tea.jpg',lines:['茶','我喜歡喝茶。']}
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

function zhVoice(){
 const voices=speechSynthesis.getVoices();
 return voices.find(v=>v.lang==='zh-TW')
 || voices.find(v=>v.lang.toLowerCase().startsWith('zh'));
}

function updateButton(){
  button.classList.toggle('is-playing',state.isPlaying);
  icon.textContent=state.isPlaying?'■':'▶';
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
   photo.src=c.img;

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
  photo.src=cards[state.index].img;
  updateButton();
});

document.addEventListener('visibilitychange',()=>{
 if(document.hidden) stopAll();
});
