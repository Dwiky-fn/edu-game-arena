/* ===== game.js — Tarik Tambang Kuis Game Engine ===== */

let gameState = {};

/* ===== WEB AUDIO SOUND FX SYNTHESIZER ===== */
const SoundFX = (() => {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function playTone(freq, duration, type = 'sine', vol = 0.25) {
    if (!enabled) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch (e) { /* ignore audio errors */ }
  }

  return {
    correct() {
      playTone(523.25, 0.12, 'sine', 0.3);   // C5
      setTimeout(() => playTone(659.25, 0.12, 'sine', 0.3), 100);  // E5
      setTimeout(() => playTone(783.99, 0.2, 'sine', 0.3), 200);   // G5
    },
    incorrect() {
      playTone(220, 0.25, 'sawtooth', 0.2);
      setTimeout(() => playTone(180, 0.3, 'sawtooth', 0.2), 150);
    },
    pull() {
      playTone(392, 0.08, 'triangle', 0.15);  // G4 short thud
    },
    countdown() {
      playTone(440, 0.15, 'sine', 0.2);       // A4 beep
    },
    victory() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => setTimeout(() => playTone(f, 0.25, 'sine', 0.3), i * 150));
    },
    get enabled() { return enabled; },
    set enabled(v) { enabled = v; },
  };
})();

function toggleSound() {
  SoundFX.enabled = !SoundFX.enabled;
  const icon = document.getElementById('sound-icon');
  if (icon) icon.textContent = SoundFX.enabled ? '🔊' : '🔇';
}
window.toggleSound = toggleSound;

/* ===== UTILITY ===== */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* ===== GAME INIT ===== */
window.onload = async () => {
  const TEAM_A = 'TIM A';
  const TEAM_B = 'TIM B';

  // URL CSV hasil publish
  const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vScSL5vv82Lhjo2XSNVjGzlj6z4klh3CukZqTwmLymm9No4pmgWcoTF1dykLbG5nDyT0HiQ4TKmoMNR/pub?output=csv';

  const soal = await loadCSVQuestions(CSV_URL);

  if (!soal || soal.length === 0) {
    alert('Soal dari spreadsheet tidak ditemukan!');
    return;
  }

  gameState = {
    teamAName: TEAM_A,
    teamBName: TEAM_B,
    teamAScore: 0,
    teamBScore: 0,
    ropePos: 50,
    timeLeft: 480,
    teamAQuestions: shuffle([...soal]),
    teamBQuestions: shuffle([...soal]),
    teamAPending: shuffle([...soal]),
    teamBPending: shuffle([...soal]),
    currentAQuestion: null,
    currentBQuestion: null,
    interval: null,
  };

  document.getElementById('team-a-label').textContent = TEAM_A;
  document.getElementById('team-b-label').textContent = TEAM_B;
  document.getElementById('team-a-name').textContent = TEAM_A;
  document.getElementById('team-b-name').textContent = TEAM_B;

  window.__gameReady = true;
  if (typeof window.__onGameReady === 'function') {
    window.__onGameReady();
  }

  // Jika start-countdown.js tidak dipasang, jalankan game langsung
  if (!window.__countdownInstalled) {
    startGame();
  }
};

/* ===== START GAME ===== */
function startGame() {
  if (gameState.interval) clearInterval(gameState.interval);
  renderQuestion('A');
  renderQuestion('B');
  startTimer();
  updateMeter();
  updateTicker();
}
window.startGame = startGame;

/* ===== RENDER QUESTION ===== */
function renderQuestion(team) {
  const isA = team === 'A';
  const pending = isA ? gameState.teamAPending : gameState.teamBPending;
  const container = document.getElementById(
    `options-container-${team.toLowerCase()}`
  );
  const text = document.getElementById(`question-text-${team.toLowerCase()}`);
  const progressEl = document.getElementById(`question-progress-${team.toLowerCase()}`);

  if (!pending || pending.length === 0) {
    if (text) text.textContent = 'Semua soal sudah dijawab benar!';
    if (container) container.innerHTML = '';
    if (progressEl) progressEl.textContent = 'Selesai ✓';
    return;
  }

  const q = pending[0];
  if (text) text.textContent = q.pertanyaan;
  if (progressEl) {
    const currentNum = (isA ? gameState.teamAScore : gameState.teamBScore) + 1;
    progressEl.textContent = `Soal ${currentNum}`;
  }

  if (!container) return;
  container.innerHTML = '';

  const optKeys = ['a', 'b', 'c', 'd'];
  optKeys.forEach((opt) => {
    if (!q['opsi_' + opt]) return;
    const btn = document.createElement('button');
    btn.className = `option-btn opt-${opt}`;
    btn.innerHTML = `
      <span class="opt-letter">${opt.toUpperCase()}</span>
      <span class="opt-text">${q['opsi_' + opt]}</span>
    `;
    btn.onclick = () => handleAnswer(team, opt.toUpperCase(), q, btn);
    container.appendChild(btn);
  });

  if (isA) gameState.currentAQuestion = q;
  else gameState.currentBQuestion = q;
}

/* ===== HANDLE ANSWER ===== */
function handleAnswer(team, selected, q, btn) {
  const correct = (q.jawaban_benar || '').toString().toUpperCase();
  const container = document.getElementById(
    `options-container-${team.toLowerCase()}`
  );
  if (!container) return;

  const isCorrect = selected === correct;

  container.querySelectorAll('button').forEach((b) => {
    const letter = b.querySelector('.opt-letter')?.textContent.trim() || b.textContent.trim()[0];
    if (isCorrect) {
      if (letter === correct) b.classList.add('correct');
    } else {
      // Jika salah, HANYA beri warna merah pada jawaban yang dipilih pemain
      // TIDAK membocorkan jawaban benar
      if (letter === selected) b.classList.add('incorrect');
    }
    b.disabled = true;
  });

  // Sound effects
  if (isCorrect) {
    SoundFX.correct();
  } else {
    SoundFX.incorrect();
  }

  const isA = team === 'A';
  let pending = isA ? gameState.teamAPending : gameState.teamBPending;

  if (isCorrect) {
    if (team === 'A') {
      gameState.teamAScore++;
      moveRope(-8);
    } else {
      gameState.teamBScore++;
      moveRope(8);
    }
    // hapus soal yang sudah benar dari pending
    pending.shift();

    // Cek knockout victory (tali melewati batas)
    if (gameState.ropePos <= 0 || gameState.ropePos >= 100) {
      if (gameState.interval) clearInterval(gameState.interval);
      SoundFX.victory();
      const knockoutWinner = gameState.ropePos <= 0 ? gameState.teamAName : gameState.teamBName;
      setTimeout(() => checkWinner(knockoutWinner), 800);
      return;
    }

    // Cek jika tim ini sudah selesai semua soal
    if (pending.length === 0) {
      if (gameState.interval) clearInterval(gameState.interval);
      SoundFX.victory();
      checkWinner(team === 'A' ? gameState.teamAName : gameState.teamBName);
      return;
    }
  } else {
    // soal salah tetap di pending, jadi muncul lagi
    pending.push(pending.shift());
  }

  updateScore();

  setTimeout(() => renderQuestion(team), 700);
}

/* ===== MOVE ROPE ===== */
function moveRope(delta) {
  gameState.ropePos += delta;
  if (gameState.ropePos > 100) gameState.ropePos = 100;
  if (gameState.ropePos < 0) gameState.ropePos = 0;

  SoundFX.pull();

  // Geser sprite gambar tug-of-war
  const tug = document.getElementById('tug-of-war');
  if (tug) {
    const shift = (gameState.ropePos - 50) * 3.5;
    tug.style.transform = `translate(${shift}px, -50%)`;
  }

  // Update flag indicator di meter
  const indicator = document.getElementById('pull-indicator');
  if (indicator) {
    indicator.style.left = `${gameState.ropePos}%`;
  }

  // Update meter fills
  updateMeter();

  // Update battle ticker
  updateTicker();
}

/* ===== UPDATE METER FILLS ===== */
function updateMeter() {
  const fillA = document.getElementById('meter-fill-a');
  const fillB = document.getElementById('meter-fill-b');

  if (fillA) {
    // Tim A dominance: rope < 50 means A is winning
    const aPull = Math.max(0, 50 - gameState.ropePos);
    fillA.style.width = `${aPull}%`;
  }
  if (fillB) {
    // Tim B dominance: rope > 50 means B is winning
    const bPull = Math.max(0, gameState.ropePos - 50);
    fillB.style.width = `${bPull}%`;
  }
}

/* ===== UPDATE BATTLE TICKER ===== */
function updateTicker() {
  const ticker = document.getElementById('battle-ticker');
  if (!ticker) return;

  const pos = gameState.ropePos;
  let msg = '';

  if (pos <= 5) {
    msg = '🔥 TIM A HAMPIR MENANG! Tali sudah di ujung! KNOCKOUT!';
    ticker.style.background = '#fef2f2';
    ticker.style.color = '#dc2626';
    ticker.style.borderColor = '#fca5a5';
  } else if (pos <= 20) {
    msg = '💪 TIM A mendominasi! Tali tertarik jauh ke kiri!';
    ticker.style.background = '#fef2f2';
    ticker.style.color = '#ef4444';
    ticker.style.borderColor = '#fca5a5';
  } else if (pos <= 40) {
    msg = '◀ TIM A unggul! Terus tarik untuk kemenangan!';
    ticker.style.background = '#fff7ed';
    ticker.style.color = '#ea580c';
    ticker.style.borderColor = '#fed7aa';
  } else if (pos >= 95) {
    msg = '🔥 TIM B HAMPIR MENANG! Tali sudah di ujung! KNOCKOUT!';
    ticker.style.background = '#eff6ff';
    ticker.style.color = '#2563eb';
    ticker.style.borderColor = '#93c5fd';
  } else if (pos >= 80) {
    msg = '💪 TIM B mendominasi! Tali tertarik jauh ke kanan!';
    ticker.style.background = '#eff6ff';
    ticker.style.color = '#3b82f6';
    ticker.style.borderColor = '#93c5fd';
  } else if (pos >= 60) {
    msg = '▶ TIM B unggul! Terus tarik untuk kemenangan!';
    ticker.style.background = '#f0fdf4';
    ticker.style.color = '#16a34a';
    ticker.style.borderColor = '#bbf7d0';
  } else {
    msg = '⚖️ Pertandingan seimbang! Jawab cepat untuk menarik tali!';
    ticker.style.background = '#f8fafc';
    ticker.style.color = '#475569';
    ticker.style.borderColor = '#e2e8f0';
  }

  ticker.textContent = msg;
}

/* ===== UPDATE SCORE ===== */
function updateScore() {
  document.getElementById('team-a-score').textContent = gameState.teamAScore;
  document.getElementById('team-b-score').textContent = gameState.teamBScore;
}

/* ===== TIMER ===== */
function startTimer() {
  const timerEl = document.getElementById('timer');
  const timerBox = document.getElementById('timer-box');
  clearInterval(gameState.interval);
  gameState.interval = setInterval(() => {
    gameState.timeLeft--;
    const m = Math.floor(gameState.timeLeft / 60);
    const s = gameState.timeLeft % 60;
    timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

    if (gameState.timeLeft <= 10 && timerBox) {
      timerBox.classList.add('timer-warning');
    }

    // game selesai saat timer habis
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.interval);
      checkWinner();
    }
  }, 1000);
}

/* ===== CHECK WINNER ===== */
function checkWinner(directWinner = null) {
  if (gameState.interval) clearInterval(gameState.interval);

  let winner = 'Seri';
  if (directWinner) {
    if (directWinner === 'A') winner = gameState.teamAName;
    else if (directWinner === 'B') winner = gameState.teamBName;
    else winner = directWinner;
  } else {
    if (gameState.teamAScore > gameState.teamBScore)
      winner = gameState.teamAName;
    else if (gameState.teamBScore > gameState.teamAScore)
      winner = gameState.teamBName;
  }

  const result = {
    winner,
    teamAName: gameState.teamAName,
    teamBName: gameState.teamBName,
    teamAScore: gameState.teamAScore,
    teamBScore: gameState.teamBScore,
    timeLeft: gameState.timeLeft,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem('gameResult', JSON.stringify(result));
  window.location.href = 'board.html';
}

/* ===== CSV LOADER ===== */
async function loadCSVQuestions(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Gagal memuat CSV: status ${res.status}`);
      return null;
    }
    const text = await res.text();

    function parseCSVRow(row) {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map((s) => s.replace(/^"|"$/g, '').trim());
    }

    const rows = text
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    if (rows.length < 2) return null;

    const questions = rows.slice(1).map((row) => {
      const cols = parseCSVRow(row);

      return {
        pertanyaan: cols[0],
        opsi_a: cols[1],
        opsi_b: cols[2],
        opsi_c: cols[3],
        opsi_d: cols[4],
        jawaban_benar: cols[5]?.toUpperCase() || '',
      };
    });

    return questions;
  } catch (err) {
    console.error('Error saat fetch CSV:', err);
    return null;
  }
}
