# Phase53 BUTTONFIX v2

## 修正内容

iPhoneで再生ボタンを画面下側へ寄せつつ、画面外へ消えないように調整しました。

## 方針

- `.app` を `height: 100svh`
- `.card` を viewport 内に収める
- iPhone縦画面では `.play-stop-button { margin-top: auto }`
- ボタンは下側に寄るが、safe-area 内に残る
- 画面が低い場合は画像・文字・ボタンを少し小さくする

## 目的

iPhone:
- 下に余白がありすぎない
- 画面下側にボタンが来る
- 画面外には消えない

PC:
- 前回同様、下に消えない
