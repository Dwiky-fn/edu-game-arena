let gameState = {};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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
    timeLeft: 60,
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

function startGame() {
  if (gameState.interval) clearInterval(gameState.interval);
  renderQuestion('A');
  renderQuestion('B');
  startTimer();
}
window.startGame = startGame;

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

  ['a', 'b', 'c', 'd'].forEach((opt) => {
    if (!q['opsi_' + opt]) return;
    const btn = document.createElement('button');
    btn.className = 'option-btn';
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
      // Jika salah, HANYA beri warna merah pada jawaban yang dipilih pemain (tidak membocorkan jawaban benar)
      if (letter === selected) b.classList.add('incorrect');
    }
    b.disabled = true;
  });

  const isA = team === 'A';
  let pending = isA ? gameState.teamAPending : gameState.teamBPending;

  if (selected === correct) {
    if (team === 'A') {
      gameState.teamAScore++;
      moveRope(-8);
    } else {
      gameState.teamBScore++;
      moveRope(8);
    }
    // hapus soal yang sudah benar dari pending
    pending.shift();

    // ✅ Cek jika tim ini sudah selesai semua soal
    if (pending.length === 0) {
      if (gameState.interval) clearInterval(gameState.interval);
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

function moveRope(delta) {
  gameState.ropePos += delta;
  if (gameState.ropePos > 100) gameState.ropePos = 100;
  if (gameState.ropePos < 0) gameState.ropePos = 0;

  const tug = document.getElementById('tug-of-war');
  if (tug) {
    const shift = (gameState.ropePos - 50) * 3;
    tug.style.transform = `translate(${shift}px, -50%)`;
  }

  const indicator = document.getElementById('pull-indicator');
  if (indicator) {
    indicator.style.left = `${gameState.ropePos}%`;
  }
}

function updateScore() {
  document.getElementById('team-a-score').textContent = gameState.teamAScore;
  document.getElementById('team-b-score').textContent = gameState.teamBScore;
}

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

    // game selesai hanya saat timer habis
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.interval);
      checkWinner();
    }
  }, 1000);
}

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
