# Phase53 BUTTONFIX

## 修正内容

PCで再生ボタンが下側に消える問題を修正しました。

## 方針

- 再生ボタンを画面下固定にしない
- カード下に自然配置
- PCでは画像高さを抑えてカード全体を画面内に収める
- iPhoneでは画像を大きく保ちつつ、ボタンが見える余白を確保

## 主な変更

- css/style.css の末尾に `Phase53 BUTTONFIX v1` を追加
- `.photo` の `max-height` を画面高に応じて制御
- `.play-stop-button` を `position: relative` に固定
- 小さい画面・低い画面向けの media query を追加
