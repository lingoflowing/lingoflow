import zipfile, xml.etree.ElementTree as ET, re, json, os, shutil, textwrap
from pathlib import Path

SRC_XLSX = Path('/mnt/data/ImageMaster600_v36_Semantic_Rebuild_02(1).xlsx')
BASE_FILES = {
  'index.html': Path('/mnt/data/index(56).html'),
  'css/style.css': Path('/mnt/data/style(4).css'),
  'js/analytics.js': Path('/mnt/data/analytics(2).js'),
  'js/audio.js': Path('/mnt/data/audio(18).js'),
  'js/bgm.js': Path('/mnt/data/bgm(16).js'),
  'js/icons.js': Path('/mnt/data/icons(1).js'),
  'js/state.js': Path('/mnt/data/state(2).js'),
  'js/timer.js': Path('/mnt/data/timer(1).js'),
}
OUT = Path('/mnt/data/lingoflow_v2_600_fix')
if OUT.exists(): shutil.rmtree(OUT)
(OUT/'data').mkdir(parents=True)
(OUT/'js').mkdir(parents=True)
(OUT/'css').mkdir(parents=True)
(OUT/'images').mkdir(parents=True)
(OUT/'tools').mkdir(parents=True)

def col_to_idx(ref):
    letters = re.match(r'[A-Z]+', ref).group(0)
    n=0
    for ch in letters:
        n=n*26+ord(ch)-64
    return n-1

def read_xlsx_sheet(path, sheet_xml='xl/worksheets/sheet2.xml'):
    ns={'a':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(path) as z:
        shared=[]
        root=ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in root.findall('a:si', ns):
            shared.append(''.join((t.text or '') for t in si.findall('.//a:t', ns)))
        root=ET.fromstring(z.read(sheet_xml))
        rows=[]
        for row in root.findall('a:sheetData/a:row', ns):
            values={}
            for c in row.findall('a:c', ns):
                ref=c.attrib.get('r')
                if not ref: continue
                v=c.find('a:v', ns)
                value=''
                if v is not None:
                    value=v.text or ''
                    if c.attrib.get('t')=='s':
                        value=shared[int(value)]
                values[col_to_idx(ref)] = value
            if values:
                max_i=max(values)
                rows.append([values.get(i,'') for i in range(max_i+1)])
        return rows

rows=read_xlsx_sheet(SRC_XLSX)
headers=rows[0]
data_rows=rows[1:]
idx={h:i for i,h in enumerate(headers) if h}
def g(row, name, default=''):
    i=idx.get(name)
    return (row[i] if i is not None and i < len(row) else default) or default

def card_id(n): return f'card_{int(float(n)):03d}'
def as_int(v):
    try: return int(float(str(v)))
    except: return 0

cards=[]; images=[]; ch_map={}; pl_map={}
for row in data_rows:
    if not g(row,'CardNo'): continue
    no=as_int(g(row,'CardNo'))
    cid=card_id(no)
    chap_no=str(g(row,'ChapterNo')).zfill(2)
    pl_no=str(g(row,'PlaylistNo')).zfill(3)
    image_path=g(row,'ImageFile') or f'images/{cid}.png'
    image_file=image_path.split('/')[-1]
    card={
        'id': cid,
        'cardNo': no,
        'chapterNo': chap_no,
        'chapterTitle': g(row,'ChapterTitle'),
        'playlistNo': pl_no,
        'playlistTitle': g(row,'PlaylistTitle'),
        'wordZh': g(row,'WordZh'),
        'wordPinyin': g(row,'WordPinyin'),
        'wordJa': g(row,'WordJa'),
        'sentenceZh': g(row,'SentenceZh'),
        'sentencePinyin': g(row,'SentencePinyin'),
        'sentenceJa': g(row,'SentenceJa'),
        'imageFile': image_file,
        'image': image_path,
    }
    image={
        'cardId': cid,
        'cardNo': no,
        'imagePath': image_path,
        'imageFile': image_file,
        'status': 'pending',
        'scene': g(row,'Scene'),
        'story': g(row,'Story'),
        'subject': g(row,'Subject'),
        'composition': g(row,'Composition'),
        'camera': g(row,'Camera'),
        'time': g(row,'Time'),
        'weather': g(row,'Weather'),
        'emotion': g(row,'Emotion'),
        'palette': g(row,'Palette'),
        'negativeSpace': g(row,'NegativeSpace'),
        'primaryMeaning': g(row,'Primary Meaning'),
        'secondaryMeaning': g(row,'Secondary Meaning'),
        'emotionSignal': g(row,'Emotion Signal'),
        'actionSignal': g(row,'Action Signal'),
        'environmentSignal': g(row,'Environment Signal'),
        'timeSignal': g(row,'Time Signal'),
        'visualPriority1': g(row,'Visual Priority 1'),
        'visualPriority2': g(row,'Visual Priority 2'),
        'visualPriority3': g(row,'Visual Priority 3'),
        'visualConcept': g(row,'Visual Concept'),
        'sceneV36': g(row,'Scene v3.6 Rebuilt'),
        'imagePromptV36': g(row,'Image Prompt v3.6'),
    }
    card['imageMeta']=image # root data.json compatibility
    cards.append(card); images.append(image)
    ch_map[chap_no]={'chapterNo':chap_no,'title':g(row,'ChapterTitle')}
    pl_map[(chap_no,pl_no)]={'chapterNo':chap_no,'playlistNo':pl_no,'title':g(row,'PlaylistTitle')}

cards.sort(key=lambda x:x['cardNo']); images.sort(key=lambda x:x['cardNo'])
chapters=sorted(ch_map.values(), key=lambda x:x['chapterNo'])
playlists=sorted(pl_map.values(), key=lambda x:(x['chapterNo'],x['playlistNo']))

for rel, src in BASE_FILES.items():
    if src.exists():
        dst=OUT/rel; dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,dst)

# Updated state with playlists/chapters but compatible
(OUT/'js/state.js').write_text("""export const state = {\n  cards: [],\n  images: [],\n  playlists: [],\n  chapters: [],\n  currentIndex: 0,\n  isPlaying: false,\n  timerId: null,\n  runId: 0\n};\n\nexport function getCurrentCard(){\n  if(!state.cards.length) return null;\n  return state.cards[state.currentIndex % state.cards.length];\n}\n\nexport function nextCard(){\n  if(!state.cards.length) return;\n  state.currentIndex = (state.currentIndex + 1) % state.cards.length;\n}\n""", encoding='utf-8')

app_js = r"""import { state, getCurrentCard, nextCard } from './state.js';
import { renderCurrentCard, rerenderForViewport, showError } from './render.js';
import { clearTimer } from './timer.js';
import {
  speak,
  speakSilent,
  startPlayback as startAudioPlayback,
  stopPlayback,
  stopAllAudio
} from './audio.js';
import { PLAY_SVG, STOP_SVG } from './icons.js';
import { track } from './analytics.js';

const button = document.getElementById('playStopButton');
const icon = document.getElementById('playStopIcon');

function updateButton(){
  button.classList.toggle('is-playing', state.isPlaying);
  icon.innerHTML = state.isPlaying ? STOP_SVG : PLAY_SVG;
  button.setAttribute('aria-label', state.isPlaying ? '停止' : '再生');
}

function textSequence(card){
  return [card.wordZh, card.sentenceZh].filter(Boolean);
}

async function playLoop(runId){
  while(state.isPlaying && runId === state.runId){
    const card = getCurrentCard();
    if(!card) break;

    renderCurrentCard();
    track('card_view', {
      index: state.currentIndex,
      total: state.cards.length,
      id: card.id || null,
      chapterNo: card.chapterNo || null,
      playlistNo: card.playlistNo || null
    });

    await speakSilent(900, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    for(const text of textSequence(card)){
      await speak(text, runId);
      if(!state.isPlaying || runId !== state.runId) break;

      await speakSilent(700, runId);
      if(!state.isPlaying || runId !== state.runId) break;
    }

    await speakSilent(1800, runId);
    if(!state.isPlaying || runId !== state.runId) break;

    track('card_complete', {
      index: state.currentIndex,
      total: state.cards.length,
      id: card.id || null,
      chapterNo: card.chapterNo || null,
      playlistNo: card.playlistNo || null
    });
    nextCard();
  }
}

function startPlayback(){
  if(state.isPlaying || !state.cards.length) return;

  track('play_start', { index: state.currentIndex, total: state.cards.length });
  const runId = startAudioPlayback();
  updateButton();
  playLoop(runId);
}

function stopAndRender(){
  if(state.isPlaying) track('play_stop', { index: state.currentIndex, total: state.cards.length });
  stopPlayback();
  updateButton();
}

async function loadJson(path){
  const response = await fetch(path, { cache: 'no-store' });
  if(!response.ok) throw new Error(`${path} load failed`);
  return response.json();
}

function mergeCardsAndImages(cards, images){
  const imageByCardId = new Map((images || []).map(image => [image.cardId, image]));

  return cards.map(card => {
    const imageMeta = imageByCardId.get(card.id) || card.imageMeta || null;
    const image = imageMeta?.imagePath || card.image || (card.imageFile ? `images/${card.imageFile}` : '');

    return {
      ...card,
      image,
      imageMeta
    };
  });
}

async function loadCards(){
  // v2本命: data/cards.json + data/images.json を必ず読む。
  // ここで旧 data.json へ安易に戻すと、30件版を読んで30→1に戻る原因になる。
  const [cards, images, playlists, chapters] = await Promise.all([
    loadJson('data/cards.json'),
    loadJson('data/images.json'),
    loadJson('data/playlists.json').catch(() => []),
    loadJson('data/chapters.json').catch(() => [])
  ]);

  if(!Array.isArray(cards) || cards.length < 600){
    throw new Error(`data/cards.json must contain 600 cards, actual: ${Array.isArray(cards) ? cards.length : 'not array'}`);
  }

  state.cards = mergeCardsAndImages(cards, Array.isArray(images) ? images : []);
  state.images = Array.isArray(images) ? images : [];
  state.playlists = Array.isArray(playlists) ? playlists : [];
  state.chapters = Array.isArray(chapters) ? chapters : [];
  state.currentIndex = 0;

  track('app_loaded', {
    cardCount: state.cards.length,
    imageCount: state.images.length,
    playlistCount: state.playlists.length,
    chapterCount: state.chapters.length
  });

  renderCurrentCard();
}

button.addEventListener('click', () => {
  if(state.isPlaying) stopAndRender();
  else startPlayback();
});

document.addEventListener('visibilitychange', () => {
  if(document.hidden) stopAndRender();
});

window.addEventListener('pagehide', () => {
  stopAndRender();
});

window.addEventListener('resize', () => {
  rerenderForViewport();
});

window.addEventListener('load', async () => {
  updateButton();

  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = () => {};
  }

  try{
    await loadCards();
  }catch(error){
    clearTimer();
    stopAllAudio();
    showError('600カードデータを読み込めませんでした。data/cards.json が600件あるか確認してください。');
    console.error(error);
  }
});
"""
(OUT/'js/app.js').write_text(app_js, encoding='utf-8')

render_js = r"""import { getCurrentCard } from './state.js';

const photo = document.getElementById('photo');
const wordZh = document.getElementById('wordZh');
const wordPinyin = document.getElementById('wordPinyin');
const wordJa = document.getElementById('wordJa');
const sentenceZh = document.getElementById('sentenceZh');
const sentencePinyin = document.getElementById('sentencePinyin');
const sentenceJa = document.getElementById('sentenceJa');

let lastImage = '';
let transitionTimerId = null;
let handlingImageError = false;

function safeText(value){
  return typeof value === 'string' ? value : '';
}

function escapeSvgText(value){
  return safeText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function placeholderImage(card){
  const title = escapeSvgText(card?.wordZh || 'LingoFlow');
  const sub = escapeSvgText(card?.sentenceZh || 'image coming soon');
  const no = escapeSvgText(card?.id || 'card');
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
    <rect width="1200" height="900" fill="#eee7dc"/>
    <rect x="72" y="72" width="1056" height="756" rx="44" fill="#f8f1e7" stroke="#d8c7af" stroke-width="3"/>
    <circle cx="230" cy="210" r="42" fill="#dfc9a8" opacity="0.72"/>
    <path d="M150 705 C290 560 405 610 520 500 C640 385 755 505 870 390 C955 310 1030 342 1095 298 L1095 780 L150 780 Z" fill="#e6d8c4"/>
    <text x="600" y="405" text-anchor="middle" font-size="82" fill="#3a3026" font-family="serif" letter-spacing="8">${title}</text>
    <text x="600" y="500" text-anchor="middle" font-size="34" fill="#8a6b44" font-family="serif">${sub}</text>
    <text x="600" y="620" text-anchor="middle" font-size="24" fill="#9b866d" font-family="serif">${no} / image coming soon</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function currentImage(card){
  if(!card) return '';
  return card.image || placeholderImage(card);
}

function setImageWithFade(src){
  if(!src || !photo) return;

  if(src === lastImage){
    photo.classList.remove('is-changing');
    return;
  }

  clearTimeout(transitionTimerId);
  handlingImageError = false;
  photo.classList.add('is-changing');

  transitionTimerId = setTimeout(() => {
    photo.src = src;
    lastImage = src;
  }, 180);
}

function setText(el, value){
  if(el) el.textContent = safeText(value);
}

if(photo){
  photo.addEventListener('load', () => {
    requestAnimationFrame(() => {
      photo.classList.remove('is-changing');
    });
  });

  photo.addEventListener('error', () => {
    if(handlingImageError) return;
    handlingImageError = true;
    const fallback = placeholderImage(getCurrentCard());
    photo.src = fallback;
    lastImage = fallback;
    photo.classList.remove('is-changing');
  });
}

export function renderCurrentCard(){
  const card = getCurrentCard();
  if(!card) return;

  setImageWithFade(currentImage(card));
  if(photo) photo.alt = safeText(card.wordJa || card.wordZh || 'LingoFlow scene');

  setText(wordZh, card.wordZh);
  setText(wordPinyin, card.wordPinyin);
  setText(wordJa, card.wordJa);
  setText(sentenceZh, card.sentenceZh);
  setText(sentencePinyin, card.sentencePinyin);
  setText(sentenceJa, card.sentenceJa);
}

export function showError(message){
  const app = document.querySelector('.app');
  if(app) app.innerHTML = `<div class="error-message">${message}</div>`;
}

export function rerenderForViewport(){
  const card = getCurrentCard();
  if(!card) return;

  const src = currentImage(card);
  if(photo && src !== lastImage){
    photo.src = src;
    lastImage = src;
  }
}
"""
(OUT/'js/render.js').write_text(render_js, encoding='utf-8')

# Write JSON files. Root data.json is intentional compatibility alias: 600 cards, not 30.
for p, data in [(OUT/'data/cards.json', cards), (OUT/'data/images.json', images), (OUT/'data/chapters.json', chapters), (OUT/'data/playlists.json', playlists), (OUT/'data.json', cards), (OUT/'data/data.json', cards)]:
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

# Builder script (no third-party libs)
builder = Path('/mnt/data/build_lingoflow_v2_fix.py').read_text(encoding='utf-8')
(OUT/'tools/build_data_from_xlsx.py').write_text(builder, encoding='utf-8')

(OUT/'README.md').write_text(f"""# LingoFlow v2 600-card fix

## 修正点

前回ZIPで30枚目の次に1枚目へ戻った原因は、実運用側が旧 `data.json` 30件を読んでいた、または `data/cards.json` への差し替えが反映されていなかったためです。

このZIPでは次を保証しています。

- `data/cards.json`: {len(cards)}件
- `data/images.json`: {len(images)}件
- `data/chapters.json`: {len(chapters)}件
- `data/playlists.json`: {len(playlists)}件
- 互換用のルート `data.json`: {len(cards)}件
- `js/app.js` は `data/cards.json` が600件未満ならエラー表示します
- 画像ファイルが無いカードは自動プレースホルダー表示します

## 上書きが必要なファイル

必ず以下をセットでアップロードしてください。

```text
index.html
css/style.css
js/app.js
js/render.js
js/state.js
js/audio.js
js/bgm.js
js/analytics.js
js/icons.js
js/timer.js
data/cards.json
data/images.json
data/chapters.json
data/playlists.json
data.json
```

特に `data.json` が旧30件のままだと、古いJSが残った環境では30→1に戻ります。

## 確認方法

ブラウザの開発者ツールで以下を確認してください。

```js
fetch('data/cards.json').then(r => r.json()).then(d => console.log(d.length))
fetch('data.json').then(r => r.json()).then(d => console.log(d.length))
```

両方とも `600` と表示されればOKです。
""", encoding='utf-8')

# verify
assert len(cards)==600, len(cards)
assert len(images)==600, len(images)
assert len(chapters)==6, len(chapters)
assert len(playlists)==30, len(playlists)

zip_path=Path('/mnt/data/lingoflow_v2_600_fix.zip')
if zip_path.exists(): zip_path.unlink()
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for f in OUT.rglob('*'):
        if f.is_file():
            z.write(f, f.relative_to(OUT))
print(zip_path)
print('cards',len(cards),'images',len(images),'chapters',len(chapters),'playlists',len(playlists))
print('first',cards[0]['id'],cards[0]['wordZh'], 'last', cards[-1]['id'], cards[-1]['wordZh'])
