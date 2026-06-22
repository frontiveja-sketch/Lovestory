# 恋愛シミュレーションゲーム

ブラウザで動くビジュアルノベル風の恋愛シミュレーションゲームです。
Claude API を使ってキャラクターがリアルタイムで返答します。

## ファイル構成

```
love-sim-game/
├── index.html      # メインHTML
├── style.css       # スタイル
├── game.js         # ゲームロジック + Claude API呼び出し + セーブ機能
├── audio.js        # BGM/SE再生（ファイル無しでも自動合成音で動作）
├── README.md
└── assets/
    ├── konuko_normal.png   # こぬ子（通常）
    ├── konuko_happy.png    # こぬ子（嬉しい）
    ├── konuko_shy.png      # こぬ子（照れ）
    ├── konuko_sad.png      # こぬ子（さみしい）
    ├── ren_normal.png ...  # 蓮の表情差分（同様に4種）
    ├── hana_normal.png ... # 花の表情差分（同様に4種）
    └── audio/
        ├── bgm_title.mp3   # タイトル画面BGM（任意）
        ├── bgm_normal.mp3  # 通常会話BGM（任意）
        ├── bgm_happy.mp3   # 好感度が高い時のBGM（任意）
        ├── bgm_ending.mp3  # エンディングBGM（任意）
        ├── se_click.mp3    # 選択肢クリックSE（任意）
        ├── se_select.mp3   # ボタン選択SE（任意）
        └── se_heart.mp3    # エンディング演出SE（任意）
```

## 機能一覧

- **表情差分**: 好感度や選択内容に応じて、立ち絵が `normal / happy / shy / sad` に切り替わります。画像が見つからない場合は自動的に `normal` → 絵文字へフォールバックします。
- **BGM・SE**: `assets/audio/` に音声ファイルを置けば再生されます。ファイルが無い場合は Web Audio API で簡易的なビープ音を自動生成して鳴らします（無音にはなりません）。右上のボタンでミュート切替が可能です。
- **セーブ機能（チェックポイント形式）**: 選択肢を選んだ時点で自動的に `localStorage` に進行状況が保存されます。タイトル画面に「続きから始める」ボタンが表示されます。

## セットアップ

### 1. キャラクター画像を追加する（任意・無くても動作します）

`assets/` フォルダに各表情の画像を置いてください。

| ファイル名 | 内容 |
|---|---|
| `konuko_normal.png` | こぬ子・通常表情 |
| `konuko_happy.png` | こぬ子・嬉しい表情 |
| `konuko_shy.png` | こぬ子・照れ表情 |
| `konuko_sad.png` | こぬ子・さみしい表情 |
| `ren_*.png` | 蓮の同様の4種 |
| `hana_*.png` | 花の同様の4種 |

すべて無くても絵文字で代替表示されるので、まずは `_normal` だけでも動かせます。

### 2. 音声ファイルを追加する（任意）

`assets/audio/` に上記の音声ファイルを置くと使用されます。置かなければ自動生成された電子音が代わりに鳴ります。

### 3. ローカルで動かす

ブラウザで直接 `index.html` を開くだけで動きます。

> **注意:** Claude API への呼び出しはブラウザから直接行います。
> 本番運用する場合は、APIキーを守るためにサーバーサイドにプロキシを挟むことを推奨します。

### 4. GitHub Pages で公開する

1. このフォルダをそのままリポジトリにプッシュ
2. Settings → Pages → Source を `main` ブランチの `/root` に設定
3. 公開されたURLでそのまま遊べます

## キャラクター・選択肢のカスタマイズ

`game.js` の `CHARS` と `CHOICES_BY_TURN` を編集してください。

```js
const CHARS = {
  konuko: {
    name: 'こぬ子',
    images: {
      normal: 'assets/konuko_normal.png',
      happy:  'assets/konuko_happy.png',
      shy:    'assets/konuko_shy.png',
      sad:    'assets/konuko_sad.png',
    },
    emoji: '🌸',
    persona: 'Claudeへのシステムプロンプト（キャラクターの性格設定）',
    opening: '最初に話しかけるセリフ',
  },
  // ... 他のキャラクター
};
```

## 技術スタック

- HTML / CSS / JavaScript（フレームワークなし）
- [Claude API](https://www.anthropic.com/) — キャラクターの返答生成
- Web Audio API — 音声ファイル未配置時のフォールバック音生成
- localStorage — セーブデータの保存
