// =========================================================
// 設定 — キャラクターと選択肢
// =========================================================
const CHARS = {
  konuko: {
    name: 'こぬ子',
    // 表情差分: normal / happy / shy / sad の4枚を assets に置く
    // ファイルが無い場合は自動的に通常絵 → 絵文字にフォールバックします
    images: {
      normal: 'assets/konuko_normal.png',
      happy:  'assets/konuko_happy.png',
      shy:    'assets/konuko_shy.png',
      sad:    'assets/konuko_sad.png',
    },
    emoji: '🌸',
    persona: 'あなたはこぬ子という名の、シャイでオタク気質な女の子です。アニメやゲームの話になると急に早口になりますが、普段は人と話すのが少し苦手で、「あの…」「えっと…」とよく言葉につまります。返答は必ず日本語で、60文字以内にしてください。',
    opening: '…あ、ごめんなさい。びっくりして…声、かけてくれたんですか？',
    bgColor: '#1a0f28',
  },
  shanko: {
    name: 'しゃんこ',
    images: {
      normal: 'assets/shanko_normal.png',
      happy:  'assets/shanko_happy.png',
      shy:    'assets/shanko_shy.png',
      sad:    'assets/shanko_sad.png',
    },
    emoji: '🔥',
    persona: 'あなたはしゃんこという名の、うるさくて元気いっぱいの女の子です。声が大きく、テンション高めで、「ねえねえ！」「やったー！」のような掛け声をよく使います。たまに空回りして照れます。返答は必ず日本語で、60文字以内にしてください。',
    opening: 'ねえねえ！やっと会えた〜！ずっと話したかったんだよ！',
    bgColor: '#2a1408',
  },
  deko: {
    name: 'デー子',
    images: {
      normal: 'assets/deko_normal.png',
      happy:  'assets/deko_happy.png',
      shy:    'assets/deko_shy.png',
      sad:    'assets/deko_sad.png',
    },
    emoji: '✨',
    persona: 'あなたはデー子という名の、落ち着きがなく気が散りやすい女の子です。話題がすぐ変わったり、そわそわしたりしますが、悪気はなく無邪気な性格です。返答は必ず日本語で、60文字以内にしてください。',
    opening: 'あっ、ねえねえ見て見て！…って、あ、あなた誰だっけ？',
    bgColor: '#10122a',
  },
};

// 表情差分が見つからなかった時に何の表情にフォールバックするか
const MOOD_FALLBACK = {
  happy: 'normal',
  shy: 'normal',
  sad: 'normal',
  normal: null, // normalが無ければ絵文字へ
};

// =========================================================
// セーブ機能（チェックポイント形式）
// 選択肢を選んだ時点のスナップショットを localStorage に保存
// =========================================================
const SAVE_KEY = 'love_sim_save_v1';

function saveCheckpoint() {
  const snapshot = {
    playerName: state.playerName,
    charKey: state.charKey,
    affection: state.affection,
    history: state.history,
    turn: state.turn,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.warn('セーブに失敗しました', e);
  }
}

function loadCheckpoint() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function hasCheckpoint() {
  return !!localStorage.getItem(SAVE_KEY);
}

function clearCheckpoint() {
  localStorage.removeItem(SAVE_KEY);
}

const CHOICES_BY_CHAR = {
  konuko: [
    [
      { text: '「その本、私も好きなんです」と話しかける', delta: 6 },
      { text: '「よかったら一緒に読みませんか」と誘う', delta: 12 },
      { text: '「…どんな内容ですか？」とだけ聞く', delta: 2 },
    ],
    [
      { text: '好きなアニメの話を振ってみる', delta: 12 },
      { text: '「もっと聞かせてください」と促す', delta: 9 },
      { text: '黙って相づちだけ打つ', delta: 3 },
    ],
    [
      { text: '「また話してもいいですか」と聞く', delta: 10 },
      { text: '笑顔で「楽しかったです」と言う', delta: 8 },
      { text: 'ただ静かに微笑む', delta: 4 },
    ],
    [
      { text: '好きな作品のグッズを見せてもらう', delta: 12 },
      { text: '「今度一緒に本屋に行きませんか」と誘う', delta: 11 },
      { text: '時間を忘れて聞き役に回る', delta: 5 },
    ],
    [
      { text: '「今度好きな作品教えてください」と誘う', delta: 12 },
      { text: '「また明日も会えますか」と聞く', delta: 8 },
      { text: '小さく手を振ってさよならを言う', delta: 3 },
    ],
  ],
  shanko: [
    [
      { text: '「元気だね！」とテンションを合わせる', delta: 10 },
      { text: '「何の話？聞かせて！」と前のめりに聞く', delta: 12 },
      { text: '「うん…」と少し圧倒されながら返す', delta: 2 },
    ],
    [
      { text: '一緒に飛び跳ねて喜ぶ', delta: 12 },
      { text: '「すごいじゃん！」とハイタッチする', delta: 11 },
      { text: '苦笑いしながら相づちを打つ', delta: 3 },
    ],
    [
      { text: '一緒に大声で笑う', delta: 10 },
      { text: '「次は何しようか！」と提案する', delta: 12 },
      { text: '苦笑いしながら相づちを打つ', delta: 4 },
    ],
    [
      { text: '「もっと話して！」と前のめりになる', delta: 12 },
      { text: '一緒に大声で歌ってみる', delta: 11 },
      { text: '少し落ち着いて話そうと提案する', delta: 5 },
    ],
    [
      { text: '「またすぐ会おうよ！」と誘う', delta: 12 },
      { text: '「今日めちゃ楽しかった」と伝える', delta: 9 },
      { text: '手を振って静かにさよならする', delta: 3 },
    ],
  ],
  deko: [
    [
      { text: '「それより、こっち見て」と注意を引く', delta: 8 },
      { text: '一緒に気になるものを見て驚く', delta: 12 },
      { text: '「えっと、誰でしたっけ」に苦笑いする', delta: 2 },
    ],
    [
      { text: '一緒にあちこち気になるものを探す', delta: 12 },
      { text: '「それ何？教えて」と話を広げる', delta: 10 },
      { text: '置いていかれないようについていく', delta: 4 },
    ],
    [
      { text: '話題が変わっても合わせてあげる', delta: 10 },
      { text: '「次どこ行く？」とノリよく聞く', delta: 12 },
      { text: '黙って後をついていく', delta: 4 },
    ],
    [
      { text: '「一緒に迷子になろう」と笑う', delta: 12 },
      { text: 'デー子のペースに合わせて話す', delta: 9 },
      { text: '少し落ち着かせるように声をかける', delta: 5 },
    ],
    [
      { text: '「また気になるもの見つけたら教えて」と言う', delta: 12 },
      { text: '「今日も忙しかったね」と笑う', delta: 8 },
      { text: '軽く手を振ってさよならする', delta: 3 },
    ],
  ],
};

function getChoicesForTurn(turn) {
  const set = CHOICES_BY_CHAR[state.charKey] ?? CHOICES_BY_CHAR.konuko;
  const idx = Math.min(turn, set.length - 1);
  return set[idx];
}

// =========================================================
// 状態
// =========================================================
let state = {
  playerName: '',
  charKey: 'konuko',
  affection: 0,
  history: [],
  turn: 0,
  busy: false,
};

// =========================================================
// DOM ユーティリティ
// =========================================================
const $ = id => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

// =========================================================
// キャラクターカード選択
// =========================================================
document.querySelectorAll('.char-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.charKey = card.dataset.char;
  });
});

// =========================================================
// ゲーム開始
// =========================================================
$('start-btn').addEventListener('click', () => {
  playSE('se_select');
  const name = $('player-name').value.trim() || 'あなた';
  state.playerName = name;
  state.affection = 0;
  state.history = [];
  state.turn = 0;
  state.busy = false;
  startGame();
});

// 「続きから」ボタン（セーブデータがある時だけ表示）
function setupContinueButton() {
  const setupInner = document.querySelector('.setup-inner');
  if (!setupInner || !hasCheckpoint()) return;

  const data = loadCheckpoint();
  if (!data) return;

  const btn = document.createElement('button');
  btn.id = 'continue-btn';
  btn.textContent = `続きから始める（${CHARS[data.charKey]?.name ?? ''} / 好感度${Math.round(data.affection)}%）`;
  btn.className = 'continue-btn';
  btn.addEventListener('click', () => {
    playSE('se_select');
    startGame(data);
  });
  setupInner.insertBefore(btn, $('start-btn'));
}
document.addEventListener('DOMContentLoaded', () => {
  setupContinueButton();
  // ブラウザの自動再生制限を避けるため、タイトルBGMは
  // 最初のクリック（開始/続きから）が起きるまで再生しない
});

function startGame(resumeData = null) {
  if (resumeData) {
    state.playerName = resumeData.playerName;
    state.charKey = resumeData.charKey;
    state.affection = resumeData.affection;
    state.history = resumeData.history;
    state.turn = resumeData.turn;
  }

  const ch = CHARS[state.charKey];

  $('char-name-badge').textContent = ch.name;
  $('dialogue-speaker').textContent = ch.name;
  updateAffection();
  showScreen('game-screen');
  setCharacterExpression('normal');
  playBGM('bgm_normal');

  if (resumeData) {
    const lastLine = [...state.history].reverse().find(h => h.role === 'assistant');
    showDialogue(lastLine ? lastLine.content : ch.opening, 'neutral');
  } else {
    showDialogue(ch.opening, 'neutral');
  }
  renderChoices(getChoicesForTurn(state.turn));
}

// =========================================================
// 表情差分の切り替え（画像が無ければ自動フォールバック）
// =========================================================
function setCharacterExpression(mood) {
  const ch = CHARS[state.charKey];
  const img = $('character-img');
  const fallback = $('character-fallback');

  // mood -> 画像パスの優先順位リストを作る（mood指定 -> normal -> 絵文字）
  const chain = [];
  if (ch.images[mood]) chain.push(ch.images[mood]);
  const fb = MOOD_FALLBACK[mood];
  if (fb && ch.images[fb] && ch.images[fb] !== ch.images[mood]) chain.push(ch.images[fb]);
  if (ch.images.normal && !chain.includes(ch.images.normal)) chain.push(ch.images.normal);

  tryLoadImageChain(img, fallback, chain, ch.emoji);
}

function tryLoadImageChain(imgEl, fallbackEl, paths, emoji) {
  if (!paths.length) {
    imgEl.style.display = 'none';
    fallbackEl.style.display = 'flex';
    fallbackEl.textContent = emoji;
    return;
  }
  const [first, ...rest] = paths;
  imgEl.onerror = () => tryLoadImageChain(imgEl, fallbackEl, rest, emoji);
  imgEl.onload = () => {
    imgEl.style.display = 'block';
    fallbackEl.style.display = 'none';
  };
  imgEl.src = first;
}

// =========================================================
// 好感度表示
// =========================================================
function updateAffection() {
  const pct = Math.min(100, state.affection);
  $('affection-fill').style.width = pct + '%';
  $('affection-value').textContent = pct + '%';
}

// =========================================================
// 台詞表示（タイプライター）
// =========================================================
function showDialogue(text, mood = 'neutral') {
  const el = $('dialogue-text');
  const loading = $('dialogue-loading');
  const wrap = $('character-wrap');

  loading.classList.remove('visible');
  el.textContent = '';

  wrap.className = 'character-wrap ' + mood;

  // moodをCHARSのimagesキーにマッピング（neutral -> normal）
  const imgMood = mood === 'neutral' ? 'normal' : mood;
  setCharacterExpression(imgMood);

  let i = 0;
  const timer = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) clearInterval(timer);
  }, 38);
}

function showLoading() {
  $('dialogue-text').textContent = '';
  $('dialogue-loading').classList.add('visible');
}

// =========================================================
// 選択肢レンダリング
// =========================================================
function renderChoices(choices) {
  const area = $('choices-area');
  area.innerHTML = '';
  choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c.text;
    btn.addEventListener('click', () => {
      playSE('se_click');
      pickChoice(i, choices);
    });
    area.appendChild(btn);
  });
}

// =========================================================
// 選択肢を選ぶ
// =========================================================
async function pickChoice(idx, choices) {
  if (state.busy) return;
  state.busy = true;

  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

  const choice = choices[idx];
  state.affection = Math.min(100, state.affection + choice.delta);
  updateAffection();

  const userLine = `${state.playerName}「${choice.text.replace(/「|」/g, '')}」`;
  state.history.push({ role: 'user', content: userLine });

  showLoading();

  try {
    const ch = CHARS[state.charKey];
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: ch.persona,
        messages: state.history.map(h => ({ role: h.role, content: h.content })),
      }),
    });

    const data = await response.json();
    const reply = data.content?.find(b => b.type === 'text')?.text ?? '…';
    state.history.push({ role: 'assistant', content: reply });

    const mood = choice.delta >= 10 ? 'happy' : choice.delta >= 6 ? 'shy' : choice.delta <= 2 ? 'sad' : 'neutral';
    showDialogue(reply, mood);
    if (mood === 'happy') playBGM('bgm_happy');
    else playBGM('bgm_normal');
  } catch (e) {
    showDialogue('…（うまく聞き取れなかった）', 'neutral');
  }

  state.turn++;
  state.busy = false;

  // チェックポイント保存（選択肢を選んだ時点を記録）
  saveCheckpoint();

  const totalTurns = (CHOICES_BY_CHAR[state.charKey] ?? CHOICES_BY_CHAR.konuko).length;

  if (state.turn >= totalTurns) {
    setTimeout(showEnding, 2200);
    return;
  }

  setTimeout(() => renderChoices(getChoicesForTurn(state.turn)), 2000);
}

// =========================================================
// エンディング（好感度によって3種類に分岐）
// =========================================================
const ENDINGS = {
  good: {
    heart: '💕',
    title: ch => `${ch.name}と、特別な関係になれた！`,
    desc: '二人の間に、温かくて大切な何かが生まれた。これからもずっと、隣にいたいと思った。',
  },
  normal: {
    heart: '🌷',
    title: ch => `${ch.name}と、いい友達になれた`,
    desc: 'まだ恋人とは言えないけれど、お互いを知れた素敵な時間だった。この関係はこれからも続いていく。',
  },
  bad: {
    heart: '🌧️',
    title: ch => `${ch.name}とは、少し距離ができてしまった`,
    desc: '伝えたかった気持ちは、うまく届かなかったみたいだ。でも、また会えばきっと話せる。',
  },
};

function getEndingType() {
  if (state.affection >= 70) return 'good';
  if (state.affection >= 35) return 'normal';
  return 'bad';
}

function showEnding() {
  const ch = CHARS[state.charKey];
  const type = getEndingType();
  const ending = ENDINGS[type];

  $('ending-heart').textContent = ending.heart;
  $('ending-title').textContent = ending.title(ch);
  $('ending-desc').textContent = ending.desc;
  $('ending-affection').textContent = `好感度 ${Math.round(state.affection)}%`;
  showScreen('ending-screen');

  if (type === 'good') {
    playSE('se_heart');
    playBGM('bgm_ending');
  } else if (type === 'normal') {
    playSE('se_select');
    playBGM('bgm_normal');
  } else {
    playBGM('bgm_normal');
  }

  clearCheckpoint(); // エンディングに到達したらチェックポイントをクリア
}

$('replay-btn').addEventListener('click', () => {
  playSE('se_select');
  showScreen('setup-screen');
  playBGM('bgm_title');
  // セットアップ画面に「続きから」ボタンが残っていれば削除（クリア済みなので不要）
  const old = $('continue-btn');
  if (old) old.remove();
});
