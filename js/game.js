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
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRUClOZxGW_LUmmKQd9homgWYR9pk7RlZDp_-0gzddEvyyrEr75aTomrPv5EbvEEpMvSQNN_YmpJyC/pub?output=csv';

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

  renderQuestion('A');
  renderQuestion('B');
  startTimer();
};

function renderQuestion(team) {
  const isA = team === 'A';
  const pending = isA ? gameState.teamAPending : gameState.teamBPending;
  const container = document.getElementById(
    `options-container-${team.toLowerCase()}`
  );
  const text = document.getElementById(`question-text-${team.toLowerCase()}`);

  if (!pending || pending.length === 0) {
    // Tim ini sudah menjawab semua soal benar → tampilkan info
    if (text) text.textContent = 'Semua soal sudah dijawab benar!';
    if (container) container.innerHTML = '';
    return; // Jangan panggil checkWinner
  }

  const q = pending[0]; // ambil soal pertama dari pending
  if (text) text.textContent = q.pertanyaan;
  if (!container) return;
  container.innerHTML = '';

  ['a', 'b', 'c', 'd'].forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = `${opt.toUpperCase()}. ${q['opsi_' + opt]}`;
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

  container.querySelectorAll('button').forEach((b) => {
    const letter = b.textContent[0];
    if (letter === correct) b.classList.add('correct');
    if (letter === selected && selected !== correct)
      b.classList.add('incorrect');
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
      // tim ini menang langsung
      clearInterval(gameState.interval); // hentikan timer
      checkWinner(team); // kirim tim yang menang
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
    const shift = (gameState.ropePos - 50) * 2;
    tug.style.transform = `translate(${shift}px, -50%)`;
  }
}

function updateScore() {
  document.getElementById('team-a-score').textContent = gameState.teamAScore;
  document.getElementById('team-b-score').textContent = gameState.teamBScore;
}

function startTimer() {
  const timerEl = document.getElementById('timer');
  clearInterval(gameState.interval);
  gameState.interval = setInterval(() => {
    gameState.timeLeft--;
    const m = Math.floor(gameState.timeLeft / 60);
    const s = gameState.timeLeft % 60;
    timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

    // game selesai hanya saat timer habis
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.interval);
      checkWinner();
    }
  }, 1000);
}

function checkWinner(directWinner = null) {
  let winner = 'Seri';
  if (directWinner) {
    winner = directWinner;
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
  const res = await fetch(url);
  const text = await res.text();

  const rows = text
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean);
  const header = rows[0].split(',').map((h) => h.trim());

  const questions = rows.slice(1).map((row) => {
    const cols = row.split(',').map((c) => c.trim());

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
}
