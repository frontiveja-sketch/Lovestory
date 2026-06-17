// =========================================================
// 設定 — キャラクターと選択肢
// =========================================================
const CHARS = {
  konuko: {
    name: 'こぬ子',
    img: 'assets/konuko.png',
    emoji: '🌸',
    persona: 'あなたはこぬ子という名の、図書館が好きな文学少女です。内気で本が好き。少し照れやすく、「あの…」「えっと…」などをよく使います。返答は必ず日本語で、60文字以内にしてください。',
    opening: '…あ、ごめんなさい。その本、私も読みたくて。',
    bgColor: '#0f0020',
  },
  ren: {
    name: '蓮（れん）',
    img: 'assets/ren.png',
    emoji: '⚡',
    persona: 'あなたは蓮という名の、クールな転校生です。口数が少なく、ぶっきらぼうに見えるが内心は優しい。返答は必ず日本語で、40文字以内の短い言葉にしてください。',
    opening: '……なんで俺の隣に座るんだ。',
    bgColor: '#00101a',
  },
  hana: {
    name: '花（はな）',
    img: 'assets/hana.png',
    emoji: '🌙',
    persona: 'あなたは花という名の、幼なじみのカフェ店員です。明るくて少しからかい好き。フレンドリーな口調で話します。返答は必ず日本語で、60文字以内にしてください。',
    opening: 'おかえり！今日も来てくれたんだ、嬉しい♪',
    bgColor: '#0a1500',
  },
};

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
  const name = $('player-name').value.trim() || 'あなた';
  state.playerName = name;
  state.affection = 0;
  state.history = [];
  state.turn = 0;
  state.busy = false;
  startGame();
});

function startGame() {
  const ch = CHARS[state.charKey];

  // キャラクター画像をセット
  const img = $('character-img');
  const fallback = $('character-fallback');
  img.src = ch.img;
  img.alt = ch.name;
  img.style.display = 'block';
  fallback.style.display = 'none';
  img.onerror = () => {
    img.style.display = 'none';
    fallback.style.display = 'flex';
    fallback.textContent = ch.emoji;
  };

  $('char-name-badge').textContent = ch.name;
  $('dialogue-speaker').textContent = ch.name;
  updateAffection();
  showScreen('game-screen');
  showDialogue(ch.opening, 'neutral');
  renderChoices(CHOICES_BY_TURN[0]);
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
    btn.addEventListener('click', () => pickChoice(i, choices));
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

    const mood = choice.delta >= 10 ? 'happy' : choice.delta >= 6 ? 'shy' : 'neutral';
    showDialogue(reply, mood);
  } catch (e) {
    showDialogue('…（うまく聞き取れなかった）', 'neutral');
  }

  state.turn++;
  state.busy = false;

  if (state.affection >= 80) {
    setTimeout(showGoodEnding, 2200);
    return;
  }

  const nextIdx = Math.min(state.turn, CHOICES_BY_TURN.length - 1);
  setTimeout(() => renderChoices(CHOICES_BY_TURN[nextIdx]), 2000);
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
}

$('replay-btn').addEventListener('click', () => {
  showScreen('setup-screen');
});
