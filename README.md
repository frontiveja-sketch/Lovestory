# 恋愛シミュレーションゲーム

ブラウザで動くビジュアルノベル風の恋愛シミュレーションゲームです。
Claude API を使ってキャラクターがリアルタイムで返答します。

## ファイル構成

```
love-sim-game/
├── index.html   # メインHTML
├── style.css    # スタイル
├── game.js      # ゲームロジック + Claude API呼び出し
├── README.md
└── assets/      # キャラクター画像を入れるフォルダ
    ├── konuko.png   # こぬ子の写真
    ├── ren.png      # 蓮の画像（任意）
    └── hana.png     # 花の画像（任意）
```

## セットアップ

### 1. 画像を追加する

`assets/` フォルダに各キャラクターの画像を置いてください。

| ファイル名 | キャラクター |
|---|---|
| `konuko.png` | こぬ子（メインヒロイン） |
| `ren.png` | 蓮（転校生） |
| `hana.png` | 花（幼なじみ） |

画像がない場合は絵文字で代替表示されます。

### 2. ローカルで動かす

ブラウザで直接 `index.html` を開くだけで動きます。

> **注意:** Claude API への呼び出しはブラウザから直接行います。  
> 本番運用する場合は、APIキーを守るためにサーバーサイドにプロキシを挟むことを推奨します。

### 3. GitHub Pages で公開する

1. このフォルダをそのままリポジトリにプッシュ
2. Settings → Pages → Source を `main` ブランチの `/root` に設定
3. 公開されたURLでそのまま遊べます

## キャラクターのカスタマイズ

`game.js` の `CHARS` オブジェクトを編集してください。

```js
const CHARS = {
  konuko: {
    name: 'こぬ子',
    img: 'assets/konuko.png',
    emoji: '🌸',
    persona: 'キャラクターの性格をここに書く（Claude へのシステムプロンプト）',
    opening: '最初に話しかけるセリフ',
  },
  // ... 他のキャラクター
};
```

## 技術スタック

- HTML / CSS / JavaScript（フレームワークなし）
- [Claude API](https://www.anthropic.com/) — キャラクターの返答生成
