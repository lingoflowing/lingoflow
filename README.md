# LingoFlow v2 data split prototype

## 目的

`CardMaster600.xlsx / ImageMaster600.xlsx` 相当の設計を、サイト運用向けに分離した構成です。

## 構成

```text
/
├─ index.html
├─ css/style.css
├─ js/app.js
├─ js/render.js
├─ js/audio.js
├─ js/bgm.js
├─ js/state.js
├─ js/timer.js
├─ js/analytics.js
├─ js/icons.js
├─ data/cards.json
├─ data/images.json
├─ data/chapters.json
├─ data/playlists.json
├─ data/data.json        # 互換・確認用の統合版
├─ images/              # 画像を少しずつ追加
├─ audio/bgm_piano.mp3   # 既存ファイルを配置
└─ tools/build_data_from_xlsx.py
```

## データ方針

- `cards.json`: 学習表示・音声読み上げに必要な本文データ
- `images.json`: 画像ファイル名・Scene・Story・Subject・Prompt v3.6 などの画像生成設計
- `chapters.json`: Chapter 管理
- `playlists.json`: Playlist 管理

## 画像追加ルール

`data/images.json` の `imagePath` に合わせて、画像を `images/` に追加します。

例:

```text
images/card_001_zaoan.png
images/card_002_breakfast.png
```

画像がまだ無いカードは、自動でプレースホルダー画像が表示されます。

## 自動変換

```bash
python tools/build_data_from_xlsx.py ImageMaster600_v36_Semantic_Rebuild_02.xlsx
```

これで以下が再生成されます。

```text
data/cards.json
data/images.json
data/chapters.json
data/playlists.json
```

## 生成結果

- cards: 600件
- images: 600件
- chapters: 6件
- playlists: 30件
