# LingoFlow v2 Phase71

## 目的
600カードを保持したまま、週替わりで20カードだけを表示・再生する運用版です。

## 主な仕様
- data/cards.json: 600 cards
- data/images.json: 600 image metadata
- data/chapters.json: 6 chapters
- data/playlists.json: 30 playlists
- 週替わりで Playlist 001〜030 を自動選択
- 1回の表示・再生は20 cards
- 表示は「Chapter名 / Playlist名 / 進捗」のみ
- Chapter番号、Playlist番号は非表示
- 画像未作成時は上品なプレースホルダーを自動表示
- index.html 初期画像なし。起動時の card_001 フラッシュ表示なし
- localStorage に現在位置を保存し、同じ週・同じPlaylistでは続きから再開

## 上書き対象
- index.html
- css/style.css
- js/app.js
- js/render.js
- js/state.js
- data/ 一式
- tools/build_data_from_xlsx.py

## 画像追加方法
images/card_001.webp など、images.json の imagePath に対応する画像を追加すると、プレースホルダーから実画像へ自動的に切り替わります。
