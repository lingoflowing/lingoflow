
const cards=[
{img:'images/morning.jpg',zh:'早安',py:'zǎo ān',ja:'おはよう',szh:'今天也早安。',spy:'jīn tiān yě zǎo ān',sja:'今日もおはよう。'},
{img:'images/mrt.jpg',zh:'捷運',py:'jié yùn',ja:'MRT',szh:'我每天坐捷運上班。',spy:'wǒ měi tiān zuò jié yùn shàng bān',sja:'毎日MRTで通勤します。'},
{img:'images/rain.jpg',zh:'下雨',py:'xià yǔ',ja:'雨',szh:'今天一直下雨。',spy:'jīn tiān yì zhí xià yǔ',sja:'今日はずっと雨です。'},
{img:'images/night.jpg',zh:'晚安',py:'wǎn ān',ja:'おやすみ',szh:'今天辛苦了，晚安。',spy:'jīn tiān xīn kǔ le',sja:'今日はお疲れさま。'},
{img:'images/tea.jpg',zh:'茶',py:'chá',ja:'お茶',szh:'我想喝一杯茶。',spy:'wǒ xiǎng hē yì bēi chá',sja:'お茶を一杯飲みたい。'}
];
let i=0,playing=false,timer=null;
function r(){let c=cards[i];photo.src=c.img;zh.textContent=c.zh;py.textContent=c.py;ja.textContent=c.ja;szh.textContent=c.szh;spy.textContent=c.spy;sja.textContent=c.sja;}
function speak(t,cb){let u=new SpeechSynthesisUtterance(t);u.lang='zh-TW';u.onend=cb;speechSynthesis.cancel();speechSynthesis.speak(u);}
function loop(){if(!playing)return;let c=cards[i];r();speak(c.zh,()=>setTimeout(()=>speak(c.szh,()=>{timer=setTimeout(()=>{i=(i+1)%cards.length;loop();},1500)}),700));}
btn.onclick=()=>{if(playing){playing=false;clearTimeout(timer);speechSynthesis.cancel();}else{playing=true;loop();}};
r();
