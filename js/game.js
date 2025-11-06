let gameState = {};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

window.onload = () => {
  const setup = JSON.parse(localStorage.getItem('gameSetup'));
  const data = JSON.parse(localStorage.getItem('eduGameData'));

  if (!setup || !data) {
    alert('Data permainan tidak ditemukan!');
    window.location.href = 'setup.html';
    return;
  }

  const folder = data.folders.find((f) => f.id === setup.folderId);
  if (!folder) {
    alert('Folder soal tidak ditemukan!');
    window.location.href = 'setup.html';
    return;
  }

  // Buat daftar soal tersisa untuk tiap tim
  gameState = {
    teamAName: setup.teamA,
    teamBName: setup.teamB,
    teamAScore: 0,
    teamBScore: 0,
    ropePos: 50,
    timeLeft: 60,
    teamAQuestions: shuffle([...folder.soal]),
    teamBQuestions: shuffle([...folder.soal]),
    teamAPending: shuffle([...folder.soal]),
    teamBPending: shuffle([...folder.soal]),
    currentAQuestion: null,
    currentBQuestion: null,
    interval: null,
  };

  document.getElementById('team-a-label').textContent = setup.teamA;
  document.getElementById('team-b-label').textContent = setup.teamB;
  document.getElementById('team-a-name').textContent = setup.teamA;
  document.getElementById('team-b-name').textContent = setup.teamB;

  renderQuestion('A');
  renderQuestion('B');
  startTimer();
};

function renderQuestion(team) {
  const isA = team === 'A';
  const pending = isA ? gameState.teamAPending : gameState.teamBPending;
  const container = document.getElementById(`options-container-${team.toLowerCase()}`);
  const text = document.getElementById(`question-text-${team.toLowerCase()}`);

  if (!pending || pending.length === 0) {
    // Tidak ada soal tersisa untuk tim ini, tampilkan kosong
    if (text) text.textContent = "Semua soal sudah dijawab benar!";
    if (container) container.innerHTML = "";
    return;
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
  const container = document.getElementById(`options-container-${team.toLowerCase()}`);
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

    // game selesai jika timer habis atau tidak ada soal tersisa di kedua tim
    if (
      gameState.timeLeft <= 0 ||
      (gameState.teamAPending.length === 0 && gameState.teamBPending.length === 0)
    ) {
      clearInterval(gameState.interval);
      checkWinner();
    }
  }, 1000);
}

function checkWinner() {
  let winner = 'Seri';
  if (gameState.teamAScore > gameState.teamBScore) winner = gameState.teamAName;
  else if (gameState.teamBScore > gameState.teamAScore)
    winner = gameState.teamBName;

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
