
const cards=[
{img:'images/morning.jpg',lines:['早安','今天也早安。']},
{img:'images/mrt.jpg',lines:['捷運','我搭捷運去上班。']},
{img:'images/rain.jpg',lines:['下雨','今天下雨了，記得帶傘。']},
{img:'images/night.jpg',lines:['夜','夜晚的台北很漂亮。']},
{img:'images/tea.jpg',lines:['茶','我喜歡喝茶。']}
];

let index=0;

function zhVoice(){
 const voices=speechSynthesis.getVoices();
 return voices.find(v=>v.lang==='zh-TW')
 || voices.find(v=>v.lang.toLowerCase().startsWith('zh'));
}

function speak(text){
 return new Promise(resolve=>{
   const u=new SpeechSynthesisUtterance(text);
   u.lang='zh-TW';
   const v=zhVoice();
   if(v) u.voice=v;
   u.onend=()=>resolve();
   u.onerror=()=>resolve();
   speechSynthesis.speak(u);
 });
}

function wait(ms){
 return new Promise(r=>setTimeout(r,ms));
}

async function loop(){
 while(true){
   const c=cards[index];
   photo.src=c.img;

   await wait(3000);

   for(const line of c.lines){
      await speak(line);
      await wait(500);
   }

   await wait(1500);
   index=(index+1)%cards.length;
 }
}

window.addEventListener('load',()=>{
 if('speechSynthesis' in window){
   speechSynthesis.onvoiceschanged=()=>{};
   loop();
 }
});

document.addEventListener('visibilitychange',()=>{
 if(document.hidden) speechSynthesis.cancel();
});
