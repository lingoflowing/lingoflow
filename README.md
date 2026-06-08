# LingoFlow v2 Weekly Playlist Progress Restore

## 仕様

- 600 cards保持
- 週替わりで20 cardsのみ表示・再生
- Chapter番号 / Playlist番号は非表示
- 表示は「台湾の朝」「朝のはじまり」「3 / 20」のみ
- 例文日本語訳と再生ボタンの間に余白を確保

## 上書き必須

- index.html
- css/style.css
- js/render.js
- js/app.js
- js/state.js
- data/ 一式

既存の data.json が残っていても、v2 は data/cards.json を優先して読み込みます。
