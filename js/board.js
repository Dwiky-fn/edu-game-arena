const result = JSON.parse(localStorage.getItem('gameResult'));

if (!result) {
  document.getElementById('title').textContent = 'Tidak Ada Data';
  document.getElementById('winner').textContent = 'Belum ada pertandingan';
} else {
  // Tentukan pemenang
  if (result.winner === 'Seri') {
    document.getElementById('trophy').textContent = '🤝';
    document.getElementById('title').textContent = 'Seri!';
    document.getElementById('winner').textContent = 'Kedua tim hebat!';
  } else {
    document.getElementById('winner').textContent = result.winner;
    createConfetti();
  }

  // Tampilkan skor
  const scoresDiv = document.getElementById('scores');
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
