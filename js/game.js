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

  gameState = {
    teamAName: setup.teamA,
    teamBName: setup.teamB,
    teamAScore: 0,
    teamBScore: 0,
    ropePos: 50,
    timeLeft: 60,
    teamAQuestions: shuffle([...folder.soal]),
    teamBQuestions: shuffle([...folder.soal]),
    currentAIndex: 0,
    currentBIndex: 0,
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
  const index = isA ? gameState.currentAIndex : gameState.currentBIndex;
  const qList = isA ? gameState.teamAQuestions : gameState.teamBQuestions;

  if (!qList || index >= qList.length) {
    checkWinner();
    return;
  }

  const q = qList[index];
  const text = document.getElementById(`question-text-${team.toLowerCase()}`);
  const container = document.getElementById(
    `options-container-${team.toLowerCase()}`
  );

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

  if (selected === correct) {
    if (team === 'A') {
      gameState.teamAScore++;
      moveRope(-8); // arah ke kiri
    } else {
      gameState.teamBScore++;
      moveRope(8); // arah ke kanan
    }
  }

  updateScore();

  if (team === 'A') gameState.currentAIndex++;
  else gameState.currentBIndex++;

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

  if (gameState.ropePos >= 100 || gameState.ropePos <= 0) {
    setTimeout(checkWinner, 800);
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
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.interval);
      checkWinner();
    }
  }, 1000);
}

function checkWinner() {
  clearInterval(gameState.interval);
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
