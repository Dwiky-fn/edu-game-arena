const result = JSON.parse(localStorage.getItem('gameResult'));

const titleEl = document.getElementById('title');
const winnerEl = document.getElementById('winner');
const trophyEl = document.getElementById('trophy');
const scoresDiv = document.getElementById('scores');

if (!result) {
  if (titleEl) titleEl.textContent = 'Tidak Ada Data';
  if (winnerEl) winnerEl.textContent = 'Belum ada pertandingan';
} else {
  // Tentukan pemenang
  if (result.winner === 'Seri') {
    if (trophyEl) trophyEl.textContent = '🤝';
    if (titleEl) titleEl.textContent = 'Seri!';
    if (winnerEl) winnerEl.textContent = 'Kedua tim hebat!';
  } else {
    if (winnerEl) winnerEl.textContent = result.winner;
    createConfetti();
  }

  // Tampilkan skor
  if (scoresDiv) {
    scoresDiv.innerHTML = `
        <div class="team ${result.winner === result.teamAName ? 'winner' : ''}">
          <h3>${result.teamAName}</h3>
          <div class="score">${result.teamAScore}</div>
        </div>
        <div class="team ${result.winner === result.teamBName ? 'winner' : ''}">
          <h3>${result.teamBName}</h3>
          <div class="score">${result.teamBScore}</div>
        </div>
      `;
  }
}

function createConfetti() {
  const colors = ['#f5576c', '#667eea', '#f093fb', '#FFD700', '#4CAF50'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }, i * 50);
  }
}
