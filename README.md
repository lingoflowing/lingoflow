# LingoFlow v2 600-card fix

## 修正点

前回ZIPで30枚目の次に1枚目へ戻った原因は、実運用側が旧 `data.json` 30件を読んでいた、または `data/cards.json` への差し替えが反映されていなかったためです。

このZIPでは次を保証しています。

- `data/cards.json`: 600件
- `data/images.json`: 600件
- `data/chapters.json`: 6件
- `data/playlists.json`: 30件
- 互換用のルート `data.json`: 600件
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
