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
    persona: 'あなたはこぬ子という名の、図書館が好きな文学少女です。内気で本が好き。少し照れやすく、「あの…」「えっと…」などをよく使います。返答は必ず日本語で、60文字以内にしてください。',
    opening: '…あ、ごめんなさい。その本、私も読みたくて。',
    bgColor: '#0f0020',
  },
  ren: {
    name: '蓮（れん）',
    images: {
      normal: 'assets/ren_normal.png',
      happy:  'assets/ren_happy.png',
      shy:    'assets/ren_shy.png',
      sad:    'assets/ren_sad.png',
    },
    emoji: '⚡',
    persona: 'あなたは蓮という名の、クールな転校生です。口数が少なく、ぶっきらぼうに見えるが内心は優しい。返答は必ず日本語で、40文字以内の短い言葉にしてください。',
    opening: '……なんで俺の隣に座るんだ。',
    bgColor: '#00101a',
  },
  hana: {
    name: '花（はな）',
    images: {
      normal: 'assets/hana_normal.png',
      happy:  'assets/hana_happy.png',
      shy:    'assets/hana_shy.png',
      sad:    'assets/hana_sad.png',
    },
    emoji: '🌙',
    persona: 'あなたは花という名の、幼なじみのカフェ店員です。明るくて少しからかい好き。フレンドリーな口調で話します。返答は必ず日本語で、60文字以内にしてください。',
    opening: 'おかえり！今日も来てくれたんだ、嬉しい♪',
    bgColor: '#0a1500',
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

const CHOICES_BY_TURN = [
  [
    { text: '「素敵な本ですね」とほめる', delta: 6 },
    { text: '「よかったら一緒に読みませんか」と誘う', delta: 12 },
    { text: '「…どんな内容ですか？」とだけ聞く', delta: 2 },
  ],
  [
    { text: '「また来てもいいですか」と聞く', delta: 10 },
    { text: '笑顔で「楽しかったです」と言う', delta: 8 },
    { text: 'ただ静かに微笑む', delta: 4 },
  ],
  [
    { text: '「一緒に帰りませんか」と誘う', delta: 12 },
    { text: '「また明日も会えますか」と聞く', delta: 8 },
    { text: '手を振ってさよならを言う', delta: 3 },
  ],
];

function getChoicesForTurn(turn) {
  const idx = Math.min(turn, CHOICES_BY_TURN.length - 1);
  return CHOICES_BY_TURN[idx];
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

  if (state.affection >= 80) {
    setTimeout(showGoodEnding, 2200);
    return;
  }

  setTimeout(() => renderChoices(getChoicesForTurn(state.turn)), 2000);
}

// =========================================================
// エンディング
// =========================================================
function showGoodEnding() {
  const ch = CHARS[state.charKey];
  $('ending-title').textContent = `${ch.name}との距離が縮まった！`;
  $('ending-desc').textContent = '二人の間に、小さくて大切な何かが生まれた気がした。';
  $('ending-affection').textContent = `好感度 ${Math.round(state.affection)}%`;
  showScreen('ending-screen');
  playSE('se_heart');
  playBGM('bgm_ending');
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
