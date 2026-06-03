# LingoFlow Phase52 10カード本体投入用ファイル

## 内容

- data/cards.json
- assets/images/card_001_zaoan.png
- assets/images/card_002_breakfast.png
- assets/images/card_003_tea.png
- assets/images/card_004_coffee.png
- assets/images/card_005_sunlight.png
- assets/images/card_006_mrt.png
- assets/images/card_007_work.png
- assets/images/card_008_window.png
- assets/images/card_009_today.png
- assets/images/card_010_walk.png

## GitHubへの反映

既存のLingoFlow本体に以下をコピーします。

```text
data/cards.json
assets/images/*.png
```

## 注意

現在は音声ファイルは未作成です。
audioWord / audioSentence は将来の音声生成用パスとして先に入れています。

## 次の作業

1. 既存の index.html / JS が data/cards.json を読むようにする
2. imageFile を `<img src="">` に反映する
3. iPhone SEで横スクロールなし確認
4. card_009 今天 は画像内文字が目立つため、後で再生成候補
