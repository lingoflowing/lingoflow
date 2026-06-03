# Phase53 FIX

## 修正内容

Phase48互換のため、root の `data.json` をオブジェクト形式から配列形式へ修正しました。

修正前:
```json
{
  "version": "...",
  "cards": [...]
}
```

修正後:
```json
[
  { "id": "card_001", ... }
]
```

## 確認

- `index.html` を開く
- まだエラーの場合は `data_check.html` を開く
- `OK: array` と表示されれば data.json 自体は正常

## 継承

- analytics.js 維持
- state.js 維持
- render.js 維持
- audio.js 維持
- timer.js 維持
