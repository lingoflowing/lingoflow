# LingoFlow v0 Prototype

昨日作成した v1 系 `.md` をベースに、ゼロから作り直した最小プロトタイプです。

## 方針

- 1画面
- 1ボタン
- 固定順
- 自動ループ
- 停止時は現在カード維持
- タブ非表示 / スリープ / ページ離脱で安全停止
- iPhone SE 320px 横スクロールなし
- 過去版の CSS / JS 継ぎ足しなし

## ファイル構成

```text
index.html
data.json
css/style.css
js/app.js
js/state.js
js/render.js
js/audio.js
js/timer.js
```

## 音声について

現時点では mp3 を入れず、ブラウザの Web Speech API を使います。
`data.json` の `audio_word` / `audio_sentence` に mp3 パスを入れると音声ファイル再生に切り替えられる構造です。

例：

```json
"audio_word": "./audio/word/coffee.mp3",
"audio_sentence": "./audio/sentence/coffee_sentence.mp3"
```

## ローカル確認

fetch で `data.json` を読むため、可能ならローカルサーバーで開いてください。

```bash
python -m http.server 8000
```

その後：

```text
http://localhost:8000
```

## 最初の検証項目

- 初回アクセスで勝手に鳴らない
- 再生ボタンで開始
- 停止ボタンで即停止
- 停止後、現在カードを維持
- タブを離れると停止
- 戻っても勝手に再開しない
- iPhone SE 幅で横スクロールしない
