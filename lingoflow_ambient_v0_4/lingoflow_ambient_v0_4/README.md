# LingoFlow ambient v0.4

ゼロから作り直した ambient prototype です。

## 目的

「台湾華語が、静かに流れる場所。」を最小構成で体験化する。

## 構成

```text
index.html
css/style.css
js/app.js
js/state.js
js/render.js
js/audio.js
js/timer.js
data.json
```

## v0.4で入れたこと

- 1画面
- 1ボタン
- 固定順再生
- 自動ループ
- SpeechSynthesis による zh-TW 読み上げ
- 表示 → 0.8秒 → 単語 → 1.0秒 → 例文 → 3.2秒 → 次
- カード切替は opacity のみの軽いフェード
- タブ非表示 / pagehide / blur で即停止
- 停止時は現在カードを維持
- BGMなし
- iPhone SE 320px 横スクロールなし

## 意図的に入れていないこと

- ログイン
- 設定画面
- モード切替
- カテゴリ選択
- 学習履歴
- ランキング
- SNS
- BGM
- 複雑な同期

## ローカル確認

`data.json` を fetch するため、ファイルを直接開くより簡易サーバーで確認してください。

```bash
python -m http.server 8000
```

その後：

```text
http://localhost:8000
```

## テスト項目

- 初回アクセスで音が鳴らない
- ▶︎ を押すと始まる
- Ⅱ を押すと止まる
- 停止後に勝手に再開しない
- 停止時に現在カードを維持する
- タブを離れると停止する
- タブ復帰で勝手に鳴らない
- iPhone SE 幅で横スクロールしない
