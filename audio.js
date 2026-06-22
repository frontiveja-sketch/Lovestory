// =========================================================
// 音声システム
// 1) assets/audio/ に音声ファイルがあればそれを再生
// 2) 無ければ Web Audio API で簡易音を合成して再生
// =========================================================

const AUDIO_PATHS = {
  bgm_title:  'assets/audio/bgm_title.mp3',
  bgm_normal: 'assets/audio/bgm_normal.mp3',
  bgm_happy:  'assets/audio/bgm_happy.mp3',
  bgm_ending: 'assets/audio/bgm_ending.mp3',
  se_click:   'assets/audio/se_click.mp3',
  se_select:  'assets/audio/se_select.mp3',
  se_heart:   'assets/audio/se_heart.mp3',
};

let audioCtx = null;
let muted = false;
let currentBgmKey = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// --- 簡易音合成（ファイルが無い時のフォールバック） ---
function synthBeep({ freq = 440, duration = 0.12, type = 'sine', gain = 0.15, glideTo = null }) {
  if (muted) return;
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + duration);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function synthClick() {
  synthBeep({ freq: 700, duration: 0.05, type: 'square', gain: 0.08 });
}
function synthSelect() {
  synthBeep({ freq: 520, duration: 0.1, type: 'sine', gain: 0.12, glideTo: 700 });
}
function synthHeart() {
  synthBeep({ freq: 600, duration: 0.18, type: 'triangle', gain: 0.15, glideTo: 900 });
  setTimeout(() => synthBeep({ freq: 800, duration: 0.22, type: 'triangle', gain: 0.13, glideTo: 1100 }), 120);
}

// ファイルが存在するか軽くチェックしてキャッシュする
const fileExistsCache = {};
function checkFileExists(path) {
  if (fileExistsCache[path] !== undefined) return Promise.resolve(fileExistsCache[path]);
  return fetch(path, { method: 'HEAD' })
    .then(res => {
      fileExistsCache[path] = res.ok;
      return res.ok;
    })
    .catch(() => {
      fileExistsCache[path] = false;
      return false;
    });
}

// --- SE再生 ---
async function playSE(key) {
  if (muted) return;
  const path = AUDIO_PATHS[key];
  const exists = path && await checkFileExists(path);
  if (exists) {
    const el = document.createElement('audio');
    el.src = path;
    el.volume = 0.6;
    el.play().catch(() => {});
    return;
  }
  // フォールバック
  if (key === 'se_click') synthClick();
  else if (key === 'se_select') synthSelect();
  else if (key === 'se_heart') synthHeart();
}

// --- BGM再生（ファイルがある時のみ。無ければ無音） ---
async function playBGM(key) {
  if (currentBgmKey === key) return;
  currentBgmKey = key;
  const bgmEl = document.getElementById('bgm');
  const path = AUDIO_PATHS[key];
  const exists = path && await checkFileExists(path);
  if (exists && !muted) {
    bgmEl.src = path;
    bgmEl.volume = 0.35;
    bgmEl.play().catch(() => {});
  } else {
    bgmEl.pause();
    bgmEl.removeAttribute('src');
  }
}

function stopBGM() {
  currentBgmKey = null;
  const bgmEl = document.getElementById('bgm');
  bgmEl.pause();
  bgmEl.removeAttribute('src');
}

// --- ミュート切替 ---
function setupMuteButton() {
  const btn = document.getElementById('mute-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    muted = !muted;
    btn.textContent = muted ? '🔇' : '🔊';
    const bgmEl = document.getElementById('bgm');
    if (muted) {
      bgmEl.pause();
    } else if (currentBgmKey) {
      bgmEl.play().catch(() => {});
    }
  });
}

document.addEventListener('DOMContentLoaded', setupMuteButton);
