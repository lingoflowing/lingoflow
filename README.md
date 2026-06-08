# LingoFlow v2 Phase70 Weekly Playlist

## 目的

600カード全体を保持しながら、実際のサイト運用では1週間に1Playlistだけを表示・再生します。

## 仕様

- `data/cards.json`：600件を保持
- `data/images.json`：600件の画像設計を保持
- `data/chapters.json`：6Chapter
- `data/playlists.json`：30Playlist
- 1Playlist = 20cards
- 毎週月曜日にPlaylistが自動切替
- 2026-06-08週を Playlist 001 として開始
- 30週後は Playlist 001 に戻る
- 画像未作成カードは自動プレースホルダー表示

## 上書き対象

必ず以下を上書きしてください。

```text
index.html
css/style.css
js/app.js
js/render.js
js/state.js
data/cards.json
data/images.json
data/chapters.json
data/playlists.json
```

旧 `data.json` だけを読む構造には戻さないでください。

## 表示

画像下に以下を表示します。

```text
Chapter 01　台湾の朝
Playlist 001　朝のはじまり
1 / 20
```

## 注意

ローカル環境で `file://` から開くと `fetch()` が失敗する場合があります。
Cloudflare Pages またはローカルサーバーで確認してください。
