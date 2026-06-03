# LingoFlow Phase53 Rebuilt

## 修正内容

Phase48の分割JS・解析を継承しつつ、表示部分を作り直しました。

継承:
- js/app.js
- js/audio.js
- js/timer.js
- js/state.js
- js/analytics.js
- js/icons.js

修正:
- index.html
- css/style.css
- js/render.js
- data.json
- images/ 10枚

## 直した問題

- 写真が旧画像に戻る問題
- 単語・例文が表示されない問題
- 再生ボタンの中身が見えない問題

## 注意

音声はWeb Speech APIで読み上げます。
画像内に文字がある card_009 今天 は将来再生成候補です。
