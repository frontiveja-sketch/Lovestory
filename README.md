# 恋愛シミュレーションゲーム

ブラウザだけで動く、GitHub Pages向けの恋愛シミュレーションゲームです。

## 公開版の安全設計

- GitHub Pages版はAPIキー不要です。
- 会話は `local-dialogue.js` のローカル会話エンジンだけで生成します。
- ブラウザから外部のAIサービスへ会話内容を送信しません。
- 認証情報やTokenをHTML・JavaScriptへ埋め込む必要はありません。
- 静的ファイルだけで動作するため、GitHub Pagesへそのまま公開できます。

## ファイル構成

```
Lovestory/
├── index.html            # 画面とスクリプト読込
├── style.css             # デザイン
├── audio.js              # BGM・効果音
├── game.js               # ゲーム進行・セーブ・エンディング
├── local-dialogue.js     # ローカル会話エンジン
├── README.md
├── konuko_normal.png
├── shanko_normal.png
└── deko_normal.png
```

## 機能

- 3人のキャラクターから相手を選択
- キャラクター別のローカル会話
- 好感度による3種類のエンディング
- ブラウザ内のチェックポイント保存
- 画像がない場合の絵文字フォールバック
- 音声ファイルがない場合の簡易効果音

## GitHub Pagesで公開する

1. リポジトリの Settings → Pages を開きます。
2. Sourceを `Deploy from a branch` にします。
3. `main` ブランチの `/(root)` を選択して保存します。
4. 表示された公開URLへアクセスします。

追加のサーバー設定や秘密情報の登録は不要です。

## カスタマイズ

- キャラクター設定と選択肢: `game.js`
- ローカル返答: `local-dialogue.js`
- デザイン: `style.css`
- 音声: `audio.js`
