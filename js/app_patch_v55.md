# app.js v55 integration patch

既存の `js/app.js` は未添付のため、丸ごと上書きせず、以下の方針で統合してください。

## 1. 先頭に追加

```js
import {
  renderCard,
  renderMode,
  renderPlaying,
  renderStatus,
  clearContent,
} from './render.js';
```

## 2. DOM直接更新を置き換え

旧：

```js
wordZh.textContent = item.zh;
wordPinyin.textContent = item.pinyin;
wordJa.textContent = item.ja;
sentenceBlock.style.display = 'none';
```

新：

```js
renderCard({
  word: {
    zh: item.zh,
    pinyin: item.pinyin,
    ja: item.ja,
  },
  sentence: {},
  image: item.image,
  imageAlt: item.zh,
});
```

文章の場合：

```js
renderCard({
  word: {},
  sentence: {
    zh: item.zh,
    pinyin: item.pinyin,
    ja: item.ja,
  },
  image: item.image,
  imageAlt: item.zh,
});
```

## 3. 再生状態更新

```js
renderPlaying(true);   // 再生中
renderPlaying(false);  // 停止中
```

## 4. 状態テキスト更新

```js
renderStatus('再生中');
renderStatus('停止しました');
```

## 5. 重要

- `:empty` は使用しない
- `style.display = ...` の直接操作を増やさない
- 表示/非表示は `.is-hidden` のみに統一
- app.js は状態・音声・イベント担当
- render.js はDOM表示担当
