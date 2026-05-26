# LingoFlow prototype_v1

## 概要

LingoFlow v1 の最小プロトタイプです。

- 初期状態は停止
- ボタン1つで再生 / 停止
- イラスト左、単語情報右
- 単語 → 間 → 例文 → 余白 → 次カード
- 5カードで自動ループ
- data.json 追加だけでカード追加可能

## 起動方法

ローカルで `index.html` を直接開くと、ブラウザによって `data.json` の読み込みが制限される場合があります。
その場合は以下で起動してください。

```bash
python -m http.server 8000
```

その後、ブラウザで以下を開きます。

```text
http://localhost:8000
```

## 注意

この prototype_v1 では音声ファイルをまだ同梱していません。
ブラウザの `speechSynthesis` を使って台湾華語を読み上げます。

将来 mp3 に差し替える場合は、`data.json` の `audio_word` / `audio_sentence` にファイルパスを入れ、`audio.js` を拡張します。
