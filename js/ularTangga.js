/* ============================================================
   ULAR TANGGA ADAB — js/ularTangga.js
   Game logic: Snakes & Ladders with Adab-themed content
   ============================================================ */

'use strict';

// ─── Constants ────────────────────────────────────────────────
const TOTAL_TILES = 30;
const COLS = 6;
const ROWS = 5;
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const PLAYER_COLORS = ['sl-color-0', 'sl-color-1', 'sl-color-2', 'sl-color-3'];
const PLAYER_COLOR_HEX = ['#f6c90e', '#22d3ee', '#f97316', '#a78bfa'];

// ─── Board Events Data ─────────────────────────────────────────
const boardEvents = {
  3: {
    type: 'ladder',
    to: 10,
    title: 'Adab Baik 🪜',
    message: 'Kamu mengucapkan salam kepada orang tua sebelum berangkat sekolah. MasyaAllah! Naik ke kotak 10!'
  },
  6: {
    type: 'question',
    title: 'Pertanyaan Adab ❓',
    question: 'Apa yang sebaiknya diucapkan saat bertemu guru?',
    options: ['Diam saja', 'Salam dengan sopan', 'Berteriak', 'Bercanda berlebihan'],
    correctAnswer: 1,
    correctMessage: 'MasyaAllah, benar! Mengucapkan salam adalah adab yang sangat mulia. Tetap semangat!',
    wrongMessage: 'Belum tepat. Yuk ingat, saat bertemu guru sebaiknya mengucapkan salam dengan sopan. 😊'
  },
  8: {
    type: 'snake',
    to: 4,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu memotong pembicaraan guru. Adab mengajarkan kita untuk sabar menunggu. Turun ke kotak 4.'
  },
  11: {
    type: 'ladder',
    to: 16,
    title: 'Adab Baik 🪜',
    message: 'Kamu mendengarkan nasihat guru dengan penuh perhatian dan sopan santun. Luar biasa! Naik ke kotak 16!'
  },
  14: {
    type: 'question',
    title: 'Pertanyaan Adab ❓',
    question: 'Bagaimana sikap yang baik saat dinasihati orang tua?',
    options: ['Mendengarkan dengan sopan', 'Membantah dengan keras', 'Pergi begitu saja', 'Menutup telinga'],
    correctAnswer: 0,
    correctMessage: 'Tepat sekali! Mendengarkan nasihat orang tua dengan sopan adalah akhlak yang terpuji. 🌟',
    wrongMessage: 'Belum tepat. Sikap yang baik adalah mendengarkan nasihat orang tua dengan penuh rasa hormat. 😊'
  },
  17: {
    type: 'snake',
    to: 9,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu berbicara kasar kepada orang yang lebih tua. Adab mengajarkan kita bertutur lembut. Turun ke kotak 9.'
  },
  19: {
    type: 'ladder',
    to: 24,
    title: 'Adab Baik 🪜',
    message: 'Kamu membantu orang tua tanpa diminta. Subhanallah, itulah bakti anak yang sholeh! Naik ke kotak 24!'
  },
  22: {
    type: 'question',
    title: 'Pertanyaan Adab ❓',
    question: 'Apa contoh adab yang benar kepada orang yang lebih tua?',
    options: ['Berkata kasar', 'Mengejek di depan umum', 'Berbicara dengan sopan', 'Tidak peduli sama sekali'],
    correctAnswer: 2,
    correctMessage: 'Benar sekali! Berbicara sopan adalah salah satu bentuk adab mulia kepada orang yang lebih tua. ✨',
    wrongMessage: 'Belum tepat. Salah satu adab kepada orang yang lebih tua adalah berbicara dengan sopan dan penuh hormat. 😊'
  },
  25: {
    type: 'snake',
    to: 18,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu tidak mengucapkan salam saat masuk rumah. Salam adalah doa dan tanda adab. Turun ke kotak 18.'
  },
  27: {
    type: 'ladder',
    to: 29,
    title: 'Adab Baik 🪜',
    message: 'Kamu meminta izin sebelum menggunakan barang milik orang lain. Masya Allah, adabmu luar biasa! Naik ke kotak 29!'
  },
  // Extra events
  13: {
    type: 'snake',
    to: 7,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu mengejek nasihat orang yang lebih tua. Nasihat adalah hadiah, hargailah! Turun ke kotak 7.'
  },
  20: {
    type: 'question',
    title: 'Pertanyaan Adab ❓',
    question: 'Apa yang harus dilakukan ketika masuk rumah?',
    options: ['Langsung masuk tanpa bilang apa-apa', 'Mengucapkan salam', 'Langsung ke kamar', 'Membunyikan klakson'],
    correctAnswer: 1,
    correctMessage: 'Benar! Mengucapkan salam saat masuk rumah adalah sunnah Nabi. Allahumma barik! 🌟',
    wrongMessage: 'Belum tepat. Yang benar adalah mengucapkan salam ketika masuk rumah. Yuk diingat ya! 😊'
  }
};

// ─── Game State ────────────────────────────────────────────────
let players = [];
let currentPlayerIndex = 0;
let gameStarted = false;
let isRolling = false;
let selectedPlayerCount = 1;

// ─── DOM References ────────────────────────────────────────────
const setupScreen     = () => document.getElementById('setupScreen');
const gameScreen      = () => document.getElementById('gameScreen');
const board           = () => document.getElementById('board');
const playerInfo      = () => document.getElementById('playerInfo');
const turnIndicator   = () => document.getElementById('turnIndicator');
const diceDisplay     = () => document.getElementById('diceDisplay');
const diceResult      = () => document.getElementById('diceResult');
const rollDiceBtn     = () => document.getElementById('rollDiceBtn');
const messageText     = () => document.getElementById('messageText');
const questionModal   = () => document.getElementById('questionModal');
const winModal        = () => document.getElementById('winModal');
const eventModal      = () => document.getElementById('eventModal');

// ─── Setup Form ────────────────────────────────────────────────

/**
 * Initialize setup screen: render player name inputs.
 */
function initSetupForm() {
  renderPlayerNameInputs(selectedPlayerCount);
}

/**
 * Change how many player inputs are shown.
 */
function selectPlayerCount(count) {
  selectedPlayerCount = count;
  document.querySelectorAll('.sl-count-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.count) === count);
  });
  renderPlayerNameInputs(count);
}

/**
 * Render player name inputs based on count.
 */
function renderPlayerNameInputs(count) {
  const container = document.getElementById('playerNamesContainer');
  const defaultNames = ['Pemain 1', 'Pemain 2', 'Pemain 3', 'Pemain 4'];
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const colorClass = PLAYER_COLORS[i];
    const colorHex   = PLAYER_COLOR_HEX[i];
    container.innerHTML += `
      <div class="sl-name-input-wrap">
        <div class="sl-player-avatar-mini sl-color-${i}" style="background:${colorHex};">${i + 1}</div>
        <input
          id="playerName${i}"
          class="sl-name-input"
          type="text"
          maxlength="20"
          placeholder="${defaultNames[i]}"
          aria-label="Nama pemain ${i + 1}"
        />
      </div>
    `;
  }
}

// ─── Start Game ────────────────────────────────────────────────

/**
 * Start the game: read names, initialize state, build board.
 */
function startGame() {
  const count = selectedPlayerCount;
  players = [];
  for (let i = 0; i < count; i++) {
    const nameInput = document.getElementById(`playerName${i}`);
    const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : `Pemain ${i + 1}`;
    players.push({ name, position: 0, color: PLAYER_COLOR_HEX[i], colorIndex: i });
  }

  currentPlayerIndex = 0;
  gameStarted = true;
  isRolling = false;

  // Switch screens
  setupScreen().classList.add('hidden');
  gameScreen().classList.remove('hidden');

  createBoard();
  updatePlayerInfo();
  renderPlayersOnBoard();
  showMessage(`Game dimulai! Giliran ${players[0].name} untuk melempar dadu. 🎲`);
}

// ─── Board ─────────────────────────────────────────────────────

/**
 * Build the 30-tile board with zig-zag numbering.
 */
function createBoard() {
  const boardEl = board();
  boardEl.innerHTML = '';

  // Build a 5x6 grid with zig-zag snake order
  // Row 0 (bottom visual) = tiles 25-30, row 4 (top visual) = tiles 1-6
  // We arrange visually: row index 0 is the TOP of the board
  // Tile 30 = top-right, tile 1 = bottom-left
  const grid = buildGrid(); // grid[row][col] = tile number (1..30), row 0 = top

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const num = grid[r][c];
      const event = boardEvents[num];
      const tileType = getTileType(num, event);

      const tile = document.createElement('div');
      tile.className = `sl-tile sl-tile-${tileType}`;
      tile.id = `tile-${num}`;
      tile.setAttribute('aria-label', `Kotak ${num}`);

      tile.innerHTML = `
        <span class="sl-tile-num">${num}</span>
        <span class="sl-tile-icon">${getTileIcon(num, event)}</span>
        <div class="sl-tile-players" id="tile-players-${num}"></div>
      `;

      boardEl.appendChild(tile);
    }
  }
}

/**
 * Build grid[row][col] = tile number using zig-zag layout.
 * Row 0 = top of board = highest-numbered tiles.
 * Bottom-left = tile 1.
 */
function buildGrid() {
  const grid = [];
  // ROWS=5, COLS=6 → 30 tiles
  // Bottom row (r=4) goes left-to-right: 1..6
  // Row r=3: right-to-left: 7..12
  // Row r=2: left-to-right: 13..18
  // Row r=1: right-to-left: 19..24
  // Row r=0: left-to-right: 25..30

  let num = 1;
  for (let r = ROWS - 1; r >= 0; r--) {
    const rowFromBottom = ROWS - 1 - r; // 0,1,2,3,4 from bottom
    const leftToRight = (rowFromBottom % 2 === 0);
    const row = [];
    if (leftToRight) {
      for (let c = 0; c < COLS; c++) row[c] = num++;
    } else {
      for (let c = COLS - 1; c >= 0; c--) row[c] = num++;
    }
    grid[r] = row;
  }
  return grid;
}

function getTileType(num, event) {
  if (num === 1)  return 'start';
  if (num === 30) return 'finish';
  if (!event)     return 'normal';
  return event.type;
}

function getTileIcon(num, event) {
  if (num === 1)  return '🚀';
  if (num === 30) return '🏆';
  if (!event)     return '';
  if (event.type === 'ladder')   return '🪜';
  if (event.type === 'snake')    return '🐍';
  if (event.type === 'question') return '❓';
  return '';
}

// ─── Dice ──────────────────────────────────────────────────────

/**
 * Roll the dice for the current player.
 */
function rollDice() {
  if (!gameStarted || isRolling) return;
  isRolling = true;

  const btn = rollDiceBtn();
  btn.disabled = true;

  // Animate dice
  const dice = diceDisplay();
  dice.classList.add('rolling');

  let rolls = 0;
  const maxRolls = 10;
  const interval = setInterval(() => {
    const tempFace = Math.floor(Math.random() * 6);
    dice.textContent = DICE_FACES[tempFace];
    rolls++;
    if (rolls >= maxRolls) {
      clearInterval(interval);
      dice.classList.remove('rolling');
      const result = Math.floor(Math.random() * 6) + 1;
      dice.textContent = DICE_FACES[result - 1];
      diceResult().textContent = `🎲 Angka dadu: ${result}`;
      movePlayer(result);
    }
  }, 60);
}

// ─── Move & Events ─────────────────────────────────────────────

/**
 * Move current player by `steps`, then handle events.
 */
function movePlayer(steps) {
  const player = players[currentPlayerIndex];
  const oldPos = player.position;
  let newPos = player.position + steps;

  if (newPos > TOTAL_TILES) {
    // Bounce back
    const excess = newPos - TOTAL_TILES;
    newPos = TOTAL_TILES - excess;
    showMessage(`${player.name} melempar ${steps}, tapi melampaui kotak 30! Mundur ${excess} langkah ke kotak ${newPos}.`);
  }

  // Animate pion moving
  player.position = newPos;
  renderPlayersOnBoard();

  // Highlight landing tile
  const landedTile = document.getElementById(`tile-${newPos}`);
  if (landedTile) {
    landedTile.classList.add('just-landed');
    setTimeout(() => landedTile.classList.remove('just-landed'), 700);
  }

  // Handle tile event after short delay
  setTimeout(() => {
    handleTileEvent(newPos);
  }, 600);
}

/**
 * Handle what happens on a tile: ladder, snake, question, or normal.
 */
function handleTileEvent(position) {
  const player = players[currentPlayerIndex];

  // Check win first
  if (position === TOTAL_TILES) {
    updatePlayerInfo();
    showWinModal(player);
    isRolling = false;
    return;
  }

  const event = boardEvents[position];

  if (!event) {
    // Normal tile
    updatePlayerInfo();
    showMessage(`${player.name} berada di kotak ${position}. Giliran berikutnya! 😊`);
    isRolling = false;
    rollDiceBtn().disabled = false;
    nextTurn();
    return;
  }

  if (event.type === 'ladder') {
    // Move up
    player.position = event.to;
    renderPlayersOnBoard();
    updatePlayerInfo();
    showEventModal('🪜', event.title, event.message, () => {
      showMessage(`✅ ${player.name} naik tangga ke kotak ${event.to}!`);
      isRolling = false;
      rollDiceBtn().disabled = false;
      nextTurn();
    });

  } else if (event.type === 'snake') {
    // Move down
    player.position = event.to;
    renderPlayersOnBoard();
    updatePlayerInfo();
    showEventModal('🐍', event.title, event.message, () => {
      showMessage(`⚠️ ${player.name} kena ular, turun ke kotak ${event.to}.`);
      isRolling = false;
      rollDiceBtn().disabled = false;
      nextTurn();
    });

  } else if (event.type === 'question') {
    updatePlayerInfo();
    showQuestionModal(event);
  }
}

// ─── Event Modal ───────────────────────────────────────────────

let eventModalCallback = null;

function showEventModal(icon, title, message, callback) {
  document.getElementById('eventModalIcon').textContent = icon;
  document.getElementById('eventModalTitle').textContent = title;
  document.getElementById('eventModalMsg').textContent  = message;
  eventModalCallback = callback;
  eventModal().classList.remove('hidden');
}

function closeEventModal() {
  eventModal().classList.add('hidden');
  if (typeof eventModalCallback === 'function') {
    eventModalCallback();
    eventModalCallback = null;
  }
}

// ─── Question Modal ────────────────────────────────────────────

/**
 * Show the question modal.
 */
function showQuestionModal(eventData) {
  const modal = questionModal();
  document.getElementById('questionTitle').textContent = eventData.title;
  document.getElementById('questionText').textContent  = eventData.question;

  const optContainer = document.getElementById('optionsContainer');
  const letters = ['A', 'B', 'C', 'D'];
  optContainer.innerHTML = '';
  eventData.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'sl-option-btn';
    btn.setAttribute('aria-label', `Pilihan ${letters[idx]}: ${opt}`);
    btn.innerHTML = `<span class="sl-opt-letter">${letters[idx]}</span> ${opt}`;
    btn.onclick = () => checkAnswer(idx, eventData);
    optContainer.appendChild(btn);
  });

  // Reset feedback
  const feedback = document.getElementById('answerFeedback');
  feedback.className = 'sl-answer-feedback hidden';
  feedback.querySelector ? null : null;
  document.getElementById('feedbackText').textContent = '';
  document.getElementById('nextTurnBtn').classList.add('hidden');

  modal.classList.remove('hidden');
}

/**
 * Check if the selected answer is correct.
 */
function checkAnswer(selectedIndex, eventData) {
  const optBtns = document.querySelectorAll('.sl-option-btn');
  const player = players[currentPlayerIndex];

  // Disable all options
  optBtns.forEach(btn => { btn.disabled = true; btn.style.pointerEvents = 'none'; });

  // Mark correct and selected wrong
  optBtns[eventData.correctAnswer].classList.add('correct');
  if (selectedIndex !== eventData.correctAnswer) {
    optBtns[selectedIndex].classList.add('wrong');
  }

  const isCorrect = selectedIndex === eventData.correctAnswer;
  const feedback  = document.getElementById('answerFeedback');
  const feedbackText = document.getElementById('feedbackText');

  feedback.className = `sl-answer-feedback ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
  feedbackText.textContent = isCorrect ? eventData.correctMessage : eventData.wrongMessage;

  // Bonus: correct answer → advance 1 step
  if (isCorrect) {
    const newPos = Math.min(player.position + 1, TOTAL_TILES);
    if (newPos !== player.position) {
      player.position = newPos;
      renderPlayersOnBoard();
      updatePlayerInfo();
      feedbackText.textContent += ` Bonus maju 1 langkah ke kotak ${newPos}! 🎉`;
    }
    showMessage(`🌟 Jawaban benar! ${eventData.correctMessage}`);
  } else {
    showMessage(`💡 ${eventData.wrongMessage}`);
  }

  document.getElementById('nextTurnBtn').classList.remove('hidden');
}

// ─── Turn Management ───────────────────────────────────────────

/**
 * Advance to next player's turn.
 */
function nextTurn() {
  // Close question modal if open
  questionModal().classList.add('hidden');

  // Check win condition
  const winner = players.find(p => p.position >= TOTAL_TILES);
  if (winner) {
    showWinModal(winner);
    return;
  }

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  updatePlayerInfo();
  showMessage(`Giliran ${players[currentPlayerIndex].name}! 🎲 Lempar dadu sekarang.`);
  rollDiceBtn().disabled = false;
  isRolling = false;
}

// ─── UI Updates ────────────────────────────────────────────────

/**
 * Update turn indicator & player cards.
 */
function updatePlayerInfo() {
  const indicator = turnIndicator();
  const current   = players[currentPlayerIndex];
  indicator.textContent = `🎯 Giliran: ${current ? current.name : '—'}`;

  const panel = playerInfo();
  panel.innerHTML = '';
  players.forEach((p, i) => {
    const isActive = i === currentPlayerIndex;
    panel.innerHTML += `
      <div class="sl-player-card ${isActive ? 'active-turn' : ''}" id="player-card-${i}">
        <div class="sl-player-avatar" style="background:${p.color};">${i + 1}</div>
        <div class="sl-player-details">
          <div class="sl-player-name">${p.name}</div>
          <div class="sl-player-pos">📍 Kotak ${p.position}</div>
        </div>
        ${isActive ? '<span class="sl-player-turn-badge">GILIRAN</span>' : ''}
      </div>
    `;
  });
}

/**
 * Render player pions on the board.
 */
function renderPlayersOnBoard() {
  // Clear all pion containers
  document.querySelectorAll('[id^="tile-players-"]').forEach(el => { el.innerHTML = ''; });

  players.forEach((p, i) => {
    if (p.position === 0) return; // Not on board yet
    const container = document.getElementById(`tile-players-${p.position}`);
    if (!container) return;

    const pion = document.createElement('div');
    pion.className = 'sl-pion';
    pion.style.background = p.color;
    pion.textContent = i + 1;
    pion.title = p.name;
    pion.style.animation = 'sl-pionMove 0.4s ease';
    container.appendChild(pion);
  });
}

/**
 * Show message in the message box.
 */
function showMessage(text) {
  const el = messageText();
  if (el) el.textContent = text;
}

// ─── Win ───────────────────────────────────────────────────────

/**
 * Show win modal with confetti.
 */
function showWinModal(player) {
  gameStarted = false;
  rollDiceBtn().disabled = true;

  document.getElementById('winPlayerName').textContent = `🏆 ${player.name} Menang!`;

  // Confetti
  spawnConfetti();

  winModal().classList.remove('hidden');
}

function spawnConfetti() {
  const container = document.getElementById('winConfetti');
  container.innerHTML = '';
  const colors = ['#f6c90e', '#f97316', '#22d3ee', '#a78bfa', '#34d399', '#fb7185'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'sl-confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${-Math.random() * 20}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      transform: rotate(${Math.random() * 360}deg);
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.8}s;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
    `;
    container.appendChild(piece);
  }
}

// ─── Reset ─────────────────────────────────────────────────────

/**
 * Reset the game back to setup screen.
 */
function resetGame() {
  gameStarted = false;
  isRolling   = false;
  players     = [];
  currentPlayerIndex = 0;

  // Close all modals
  winModal().classList.add('hidden');
  questionModal().classList.add('hidden');
  eventModal().classList.add('hidden');

  // Clear board
  board().innerHTML = '';
  playerInfo().innerHTML = '';

  // Reset dice
  diceDisplay().textContent = '🎲';
  diceResult().textContent  = 'Tekan tombol untuk lempar dadu!';
  rollDiceBtn().disabled    = false;

  // Switch screens
  gameScreen().classList.add('hidden');
  setupScreen().classList.remove('hidden');
}

// ─── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initSetupForm();
});
