/* ============================================================
   ULAR TANGGA ADAB — js/ularTangga.js
   Game logic: Snakes & Ladders with Adab-themed content
   ============================================================ */

'use strict';

// ─── Constants ────────────────────────────────────────────────
const TOTAL_TILES = 100;
const COLS = 10;
const ROWS = 10;
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const PLAYER_COLORS = ['sl-color-0', 'sl-color-1', 'sl-color-2', 'sl-color-3'];
const PLAYER_COLOR_HEX = ['#f6c90e', '#22d3ee', '#f97316', '#a78bfa'];

// ─── Board Events Data ─────────────────────────────────────────
const boardEvents = {
  // LADDERS (Maju)
  20: {
    type: 'ladder',
    to: 50,
    title: 'Adab Baik 🪜',
    message: 'Kamu bersikap sopan kepada tetangga. Naik ke kotak 50!'
  },
  21: {
    type: 'ladder',
    to: 79,
    title: 'Adab Baik 🪜',
    message: 'Kamu membantu membersihkan rumah. Naik ke kotak 79!'
  },
  35: {
    type: 'ladder',
    to: 95,
    title: 'Adab Baik 🪜',
    message: 'Kamu menghormati guru di sekolah. Naik ke kotak 95!'
  },
  62: {
    type: 'ladder',
    to: 82,
    title: 'Adab Baik 🪜',
    message: 'Kamu selalu berkata jujur. Naik ke kotak 82!'
  },
  66: {
    type: 'ladder',
    to: 95,
    title: 'Adab Baik 🪜',
    message: 'Kamu berbagi makanan dengan teman. Naik ke kotak 95!'
  },
  69: {
    type: 'ladder',
    to: 89,
    title: 'Adab Baik 🪜',
    message: 'Kamu menyayangi hewan peliharaan. Naik ke kotak 89!'
  },
  90: {
    type: 'ladder',
    to: 91,
    title: 'Adab Baik 🪜',
    message: 'Kamu membantu adik belajar. Naik ke kotak 91!'
  },

  // SNAKES (Mundur / Perosotan)
  22: {
    type: 'snake',
    to: 17,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu merebut mainan adik secara kasar. Turun ke kotak 17.'
  },
  57: {
    type: 'snake',
    to: 43,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu tidak mendengarkan penjelasan guru. Turun ke kotak 43.'
  },
  75: {
    type: 'snake',
    to: 68,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu marah-marah saat dinasihati. Turun ke kotak 68.'
  },
  84: {
    type: 'snake',
    to: 78,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu berbohong kepada temanmu. Turun ke kotak 78.'
  },
  92: {
    type: 'snake',
    to: 73,
    title: 'Sikap Kurang Baik 🐍',
    message: 'Kamu membuang sampah sembarangan. Turun ke kotak 73.'
  },

  // QUESTIONS (Pertanyaan)
  2: {
    type: 'question',
    title: 'Kuis Matematika ❓',
    question: 'Berapakah hasil dari 1 + 1?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1,
    correctMessage: 'Benar! Matematika dasar yang bagus! 🌟',
    wrongMessage: 'Belum tepat. 1 + 1 adalah 2. 😊'
  },
  6: {
    type: 'question',
    title: 'Kuis Matematika ❓',
    question: 'Berapakah hasil dari 3 + 3?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 1,
    correctMessage: 'Luar biasa, jawabanmu tepat! 🌟',
    wrongMessage: 'Belum tepat. 3 + 3 adalah 6. 😊'
  },
  7: {
    type: 'question',
    title: 'Kuis Pengetahuan Islam ❓',
    question: 'Berapa jumlah ayat dalam Surat Al-Fatihah?',
    options: ['5 ayat', '6 ayat', '7 ayat', '8 ayat'],
    correctAnswer: 2,
    correctMessage: 'MasyaAllah, benar sekali! Surat Al-Fatihah terdiri dari 7 ayat. 🌟',
    wrongMessage: 'Belum tepat. Surat Al-Fatihah memiliki 7 ayat. 😊'
  },
  8: {
    type: 'question',
    title: 'Tebak Hewan ❓',
    question: 'Hewan apa yang digambarkan pada kotak 8?',
    options: ['Kambing', 'Kuda', 'Sapi', 'Unta'],
    correctAnswer: 1,
    correctMessage: 'Benar, itu adalah gambar Kuda! 🐴',
    wrongMessage: 'Kurang tepat. Itu adalah gambar Kuda. 😊'
  },
  18: {
    type: 'question',
    title: 'Pertanyaan Adab ❓',
    question: 'Bagaimana cara kita menjawab jika ditanya umur atau kabar oleh orang tua?',
    options: ['Menjawab dengan sopan dan senyuman', 'Berdiam diri saja', 'Menjawab dengan ketus', 'Berteriak keras'],
    correctAnswer: 0,
    correctMessage: 'Tepat! Menjawab orang tua harus selalu sopan dan ramah. 🌟',
    wrongMessage: 'Belum tepat. Kita harus menjawab dengan sopan dan penuh kelembutan. 😊'
  },
  23: {
    type: 'question',
    title: 'Kuis Perkalian ❓',
    question: 'Berapakah hasil dari 4 x 6?',
    options: ['20', '22', '24', '26'],
    correctAnswer: 2,
    correctMessage: 'Hebat, 4 x 6 adalah 24! 🌟',
    wrongMessage: 'Belum tepat. 4 x 6 adalah 24. 😊'
  },
  29: {
    type: 'question',
    title: 'Kuis Pembagian ❓',
    question: 'Berapakah hasil dari 60 : 2?',
    options: ['20', '25', '30', '35'],
    correctAnswer: 2,
    correctMessage: 'Tepat sekali! 60 dibagi 2 adalah 30. 🌟',
    wrongMessage: 'Belum tepat. 60 : 2 adalah 30. 😊'
  },
  32: {
    type: 'question',
    title: 'Kuis Agama Islam ❓',
    question: 'Siapakah nama nabi pertama yang diciptakan oleh Allah SWT?',
    options: ['Nabi Muhammad SAW', 'Nabi Ibrahim AS', 'Nabi Adam AS', 'Nabi Isa AS'],
    correctAnswer: 2,
    correctMessage: 'MasyaAllah, benar! Nabi pertama adalah Nabi Adam AS. 🌟',
    wrongMessage: 'Belum tepat. Nabi pertama adalah Nabi Adam AS. 😊'
  },
  42: {
    type: 'question',
    title: 'Kuis Agama Islam ❓',
    question: 'Ada berapakah jumlah Rukun Islam?',
    options: ['3 rukun', '4 rukun', '5 rukun', '6 rukun'],
    correctAnswer: 2,
    correctMessage: 'Benar sekali! Rukun Islam ada 5 rukun. 🌟',
    wrongMessage: 'Belum tepat. Rukun Islam terdiri dari 5 perkara. 😊'
  },
  44: {
    type: 'question',
    title: 'Kuis Perkalian ❓',
    question: 'Berapakah hasil dari 6 x 6?',
    options: ['30', '32', '36', '40'],
    correctAnswer: 2,
    correctMessage: 'Tepat sekali! 6 x 6 = 36. 🌟',
    wrongMessage: 'Belum tepat. 6 x 6 adalah 36. 😊'
  },
  59: {
    type: 'question',
    title: 'Kuis Perkalian ❓',
    question: 'Berapakah hasil dari 7 x 6?',
    options: ['40', '42', '44', '46'],
    correctAnswer: 1,
    correctMessage: 'Tepat sekali, 7 x 6 adalah 42! 🌟',
    wrongMessage: 'Belum tepat. 7 x 6 adalah 42. 😊'
  },
  63: {
    type: 'question',
    title: 'Kuis Perkalian ❓',
    question: 'Berapakah hasil dari 9 x 7?',
    options: ['56', '63', '70', '72'],
    correctAnswer: 1,
    correctMessage: 'Benar! 9 x 7 adalah 63. 🌟',
    wrongMessage: 'Belum tepat. 9 x 7 adalah 63. 😊'
  },
  70: {
    type: 'question',
    title: 'Kuis Agama Islam ❓',
    question: 'Sebutkan nama 2 Malaikat Allah yang wajib kita ketahui!',
    options: ['Jibril dan Mikail', 'Munkar dan Nakir', 'Raqib dan Atid', 'Semua jawaban benar'],
    correctAnswer: 3,
    correctMessage: 'Luar biasa, benar! Ketiganya adalah malaikat Allah yang wajib kita ketahui. 🌟',
    wrongMessage: 'Kurang tepat. Semua pilihan di atas adalah malaikat Allah yang wajib diketahui. 😊'
  },
  78: {
    type: 'question',
    title: 'Kuis Perkalian ❓',
    question: 'Berapakah hasil dari 7 x 11?',
    options: ['70', '77', '84', '88'],
    correctAnswer: 1,
    correctMessage: 'Hebat, perkalianmu luar biasa! 🌟',
    wrongMessage: 'Belum tepat. 7 x 11 adalah 77. 😊'
  },
  80: {
    type: 'question',
    title: 'Kuis Pembagian ❓',
    question: 'Berapakah hasil dari 120 : 2?',
    options: ['50', '60', '70', '80'],
    correctAnswer: 1,
    correctMessage: 'Benar sekali! 120 : 2 = 60. 🌟',
    wrongMessage: 'Belum tepat. 120 : 2 adalah 60. 😊'
  },
  81: {
    type: 'question',
    title: 'Kuis Pembagian ❓',
    question: 'Berapakah hasil dari 160 : 2?',
    options: ['70', '80', '90', '100'],
    correctAnswer: 1,
    correctMessage: 'Hebat! 160 : 2 = 80. 🌟',
    wrongMessage: 'Belum tepat. 160 : 2 adalah 80. 😊'
  },
  98: {
    type: 'question',
    title: 'Kuis Agama Islam ❓',
    question: 'Sebagai umat Islam, kita adalah umat dari Nabi siapa?',
    options: ['Nabi Musa AS', 'Nabi Ibrahim AS', 'Nabi Muhammad SAW', 'Nabi Isa AS'],
    correctAnswer: 2,
    correctMessage: 'MasyaAllah, benar! Kita adalah umat Nabi Muhammad SAW. 🌟',
    wrongMessage: 'Belum tepat. Kita adalah umat kekasih Allah, Nabi Muhammad SAW. 😊'
  }
};

const tilePalette = [
  '#fff3a3', '#a7e8ff', '#b9f6b0', '#ffb4a8', '#ffd08a',
  '#d7bcff', '#ffb3d9', '#b8f7e4', '#ffe28a', '#a8d8ff',
  '#c9f28d', '#ffcfdf'
];

const tilePrompts = [
  { label: 'Senyum sopan', icon: '&#128522;' },
  { label: 'Ucap salam', icon: '&#128075;' },
  { label: 'Baca doa', icon: '&#129330;' },
  { label: 'Dengar guru', icon: '&#128066;' },
  { label: 'Bantu teman', icon: '&#129309;' },
  { label: 'Rapikan buku', icon: '&#128214;' },
  { label: 'Izin dahulu', icon: '&#9757;' },
  { label: 'Terima kasih', icon: '&#11088;' },
  { label: 'Jaga lisan', icon: '&#128483;' },
  { label: 'Antri rapi', icon: '&#128694;' }
];

const tileText = {
  1: { label: 'Start Basmalah', icon: '&#127939;' },
  2: { label: '1 + 1?', icon: '&#10067;' },
  6: { label: '3 + 3?', icon: '&#10067;' },
  7: { label: 'Al-Fatihah?', icon: '&#10067;' },
  8: { label: 'Tebak hewan', icon: '&#10067;' },
  12: { label: 'Cium tangan', icon: '&#129309;' },
  16: { label: 'Minta izin', icon: '&#9757;' },
  18: { label: 'Jawab sopan', icon: '&#10067;' },
  20: { label: 'Naik ke 50', icon: '&#129692;' },
  21: { label: 'Naik ke 79', icon: '&#129692;' },
  22: { label: 'Turun ke 17', icon: '&#128013;' },
  23: { label: '4 x 6?', icon: '&#10067;' },
  29: { label: '60 : 2?', icon: '&#10067;' },
  32: { label: 'Nabi pertama?', icon: '&#10067;' },
  35: { label: 'Naik ke 95', icon: '&#129692;' },
  38: { label: 'Bantu ibu', icon: '&#127968;' },
  42: { label: 'Rukun Islam?', icon: '&#10067;' },
  44: { label: '6 x 6?', icon: '&#10067;' },
  50: { label: 'Adab baik', icon: '&#11088;' },
  57: { label: 'Turun ke 43', icon: '&#128013;' },
  59: { label: '7 x 6?', icon: '&#10067;' },
  62: { label: 'Naik ke 82', icon: '&#129692;' },
  63: { label: '9 x 7?', icon: '&#10067;' },
  66: { label: 'Naik ke 95', icon: '&#129692;' },
  69: { label: 'Naik ke 89', icon: '&#129692;' },
  70: { label: 'Nama malaikat?', icon: '&#10067;' },
  75: { label: 'Turun ke 68', icon: '&#128013;' },
  78: { label: '7 x 11?', icon: '&#10067;' },
  80: { label: '120 : 2?', icon: '&#10067;' },
  81: { label: '160 : 2?', icon: '&#10067;' },
  84: { label: 'Turun ke 78', icon: '&#128013;' },
  90: { label: 'Naik ke 91', icon: '&#129692;' },
  92: { label: 'Turun ke 73', icon: '&#128013;' },
  95: { label: 'Bintang adab', icon: '&#11088;' },
  98: { label: 'Umat nabi?', icon: '&#10067;' },
  100: { label: 'Finish Selesai', icon: '&#127942;' }
};

// ─── Game State ────────────────────────────────────────────────
let players = [];
let currentPlayerIndex = 0;
let gameStarted = false;
let isRolling = false;
let selectedPlayerCount = 1;

// ─── DOM References ────────────────────────────────────────────
const setupScreen = () => document.getElementById('setupScreen');
const gameScreen = () => document.getElementById('gameScreen');
const board = () => document.getElementById('board');
const playerInfo = () => document.getElementById('playerInfo');
const turnIndicator = () => document.getElementById('turnIndicator');
const diceImg = () => document.getElementById('diceImg');
const diceNumber = () => document.getElementById('diceNumber');
const diceResult = () => document.getElementById('diceResult');
const rollDiceBtn = () => document.getElementById('rollDiceBtn');
const messageText = () => document.getElementById('messageText');
const questionModal = () => document.getElementById('questionModal');
const winModal = () => document.getElementById('winModal');
const eventModal = () => document.getElementById('eventModal');

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
    const colorHex = PLAYER_COLOR_HEX[i];
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
 * Build the 100-tile board with zig-zag numbering.
 */
function createBoard() {
  const boardEl = board();
  boardEl.innerHTML = '';

  const grid = buildGrid(); // grid[row][col] = tile number (1..100), row 0 = top

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const num = grid[r][c];
      const event = boardEvents[num];
      const tileType = getTileType(num, event);
      const content = getTileContent(num, event);

      const tile = document.createElement('div');
      tile.className = `sl-tile sl-tile-${tileType}`;
      tile.id = `tile-${num}`;
      tile.setAttribute('aria-label', `Kotak ${num}`);
      tile.style.setProperty('--tile-bg', tilePalette[(num - 1) % tilePalette.length]);

      tile.innerHTML = `
        <span class="sl-tile-num">${num}</span>
        <span class="sl-tile-icon">${content.icon}</span>
        <span class="sl-tile-label">${content.label}</span>
        <div class="sl-tile-players" id="tile-players-${num}"></div>
      `;

      boardEl.appendChild(tile);
    }
  }

  createBoardOverlays(boardEl);
}

function createBoardOverlays(boardEl) {
  const overlay = document.createElement('div');
  overlay.className = 'sl-board-overlays';

  Object.entries(boardEvents).forEach(([from, event]) => {
    if (!event || (event.type !== 'ladder' && event.type !== 'snake')) return;

    const start = getTileCenter(Number(from));
    const end = getTileCenter(event.to);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt((dx * dx) + (dy * dy));
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    const art = document.createElement('img');
    art.className = `sl-board-art sl-board-art-${event.type}`;
    art.src = event.type === 'ladder' ? 'assets/ular-tangga/ladder.png' : 'assets/ular-tangga/snake.png';
    art.alt = event.type === 'ladder' ? 'Tangga' : 'Ular';
    art.style.left = `${midX}%`;
    art.style.top = `${midY}%`;
    art.style.width = `${distance}%`;
    art.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    overlay.appendChild(art);
  });

  boardEl.appendChild(overlay);
}

function getTileCenter(num) {
  const rowFromBottom = Math.floor((num - 1) / COLS);
  const indexInRow = (num - 1) % COLS;
  const leftToRight = rowFromBottom % 2 === 0;
  const col = leftToRight ? indexInRow : COLS - 1 - indexInRow;
  const row = ROWS - 1 - rowFromBottom;

  return {
    x: ((col + 0.5) / COLS) * 100,
    y: ((row + 0.5) / ROWS) * 100
  };
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
  if (num === 1) return 'start';
  if (num === 100) return 'finish';
  if (!event) return 'normal';
  return event.type;
}

function getTileIcon(num, event) {
  if (num === 1) return '🚀';
  if (num === 100) return '🏆';
  if (!event) return '';
  if (event.type === 'ladder') return '🪜';
  if (event.type === 'snake') return '🐍';
  if (event.type === 'question') return '❓';
  return '';
}

function getTileContent(num, event) {
  if (tileText[num]) return tileText[num];
  if (event && event.type === 'question') return { label: 'Pertanyaan', icon: '&#10067;' };
  if (event && event.type === 'ladder') return { label: `Naik ke ${event.to}`, icon: '&#129692;' };
  if (event && event.type === 'snake') return { label: `Turun ke ${event.to}`, icon: '&#128013;' };
  return tilePrompts[(num - 1) % tilePrompts.length];
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
  const img = diceImg();
  const numDiv = diceNumber();

  img.classList.add('rolling');
  numDiv.textContent = '?';

  let rolls = 0;
  const maxRolls = 10;
  const interval = setInterval(() => {
    numDiv.textContent = Math.floor(Math.random() * 6) + 1;
    rolls++;
    if (rolls >= maxRolls) {
      clearInterval(interval);
      img.classList.remove('rolling');
      const result = Math.floor(Math.random() * 6) + 1;
      numDiv.textContent = result;
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
    showMessage(`${player.name} melempar ${steps}, tapi melampaui kotak ${TOTAL_TILES}! Mundur ${excess} langkah ke kotak ${newPos}.`);
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
  document.getElementById('eventModalMsg').textContent = message;
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
  document.getElementById('questionText').textContent = eventData.question;

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
  const feedback = document.getElementById('answerFeedback');
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
  const current = players[currentPlayerIndex];
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
    pion.className = `sl-pion sl-pion-p${i + 1}`;
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
  isRolling = false;
  players = [];
  currentPlayerIndex = 0;

  // Close all modals
  winModal().classList.add('hidden');
  questionModal().classList.add('hidden');
  eventModal().classList.add('hidden');

  // Clear board
  board().innerHTML = '';
  playerInfo().innerHTML = '';

  // Reset dice
  diceNumber().textContent = '';
  diceResult().textContent = 'Tekan tombol untuk lempar dadu!';
  rollDiceBtn().disabled = false;

  // Switch screens
  gameScreen().classList.add('hidden');
  setupScreen().classList.remove('hidden');
}

// ─── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initSetupForm();
});
