
const cards=[
{theme:'朝の情景',zh:'早安',py:'zǎo ān',ja:'おはよう',szh:'今天也早安。',spy:'jīn tiān yě zǎo ān',sja:'今日もおはよう。'},
{theme:'MRTの情景',zh:'捷運',py:'jié yùn',ja:'MRT',szh:'我每天坐捷運上班。',spy:'wǒ měi tiān zuò jié yùn shàng bān',sja:'毎日MRTで通勤します。'},
{theme:'雨の情景',zh:'下雨',py:'xià yǔ',ja:'雨が降る',szh:'今天一直下雨。',spy:'jīn tiān yì zhí xià yǔ',sja:'今日はずっと雨です。'},
{theme:'夜の情景',zh:'晚安',py:'wǎn ān',ja:'おやすみ',szh:'今天辛苦了，晚安。',spy:'jīn tiān xīn kǔ le，wǎn ān',sja:'今日はお疲れさま、おやすみ。'},
{theme:'茶の情景',zh:'茶',py:'chá',ja:'お茶',szh:'我想喝一杯茶。',spy:'wǒ xiǎng hē yì bēi chá',sja:'お茶を一杯飲みたい。'}
];
let i=0;
function render(){
const c=cards[i];
imageBox.textContent=c.theme;
zh.textContent=c.zh; py.textContent=c.py; ja.textContent=c.ja;
szh.textContent=c.szh; spy.textContent=c.spy; sja.textContent=c.sja;
card.classList.remove('fade'); void card.offsetWidth; card.classList.add('fade');
}
playBtn.onclick=()=>{i=(i+1)%cards.length;render();};
render();
