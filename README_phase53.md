# LingoFlow Phase53 Phase48 Inherited

## 目的

Phase48 の構成を維持したまま、Phase52で作成した10カード・10画像を統合。

## 継承したいもの

- js分割構成
- analytics.js
- state.js
- render.js
- audio.js
- timer.js
- app.js
- Elegant transition
- Analytics events
- 音声安全設計

## 追加・更新したもの

- data.json
- data/cards.json
- assets/images/*.png
- images/*.png 互換コピー

## 10カード

1. 早安
2. 早餐
3. 茶
4. 咖啡
5. 陽光
6. 捷運
7. 上班
8. 窗戶
9. 今天
10. 散步

## 注意

- 音声ファイルは未作成。
- card_009 今天 は画像内に文字があるため、将来再生成候補。
- Phase48のJSが特定フィールド名に依存していて表示が合わない場合に備え、data.jsonには `wordZh` と `zh` などの互換キーを両方入れています。

## 検出したJS

- js/analytics.js
- js/app.js
- js/audio.js
- js/icons.js
- js/render.js
- js/state.js
- js/timer.js

## analytics.js

あり
