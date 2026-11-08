const result = JSON.parse(localStorage.getItem('gameResult'));

const titleEl = document.getElementById('title');
const winnerEl = document.getElementById('winner');
const trophyEl = document.getElementById('trophy');
const quoteEl = document.getElementById('winner-quote');
const badgeEl = document.getElementById('badge');
const scoresDiv = document.getElementById('scores');
const matchStatsDiv = document.getElementById('match-stats');

if (!result) {
  if (titleEl) titleEl.textContent = 'Tidak Ada Data';
  if (winnerEl) winnerEl.textContent = 'Belum Ada Pertandingan';
  if (quoteEl) quoteEl.textContent = 'Mainkan kuis tarik tambang sekarang untuk melihat skor pertandingan!';
  if (trophyEl) trophyEl.textContent = '🎮';
  if (badgeEl) badgeEl.textContent = 'INFORMASI';
} else {
    const isDraw = result.winner === 'Seri';
    const isTeamAWinner = !isDraw && (result.winner === result.teamAName || result.winner === 'TIM A');
    const isTeamBWinner = !isDraw && (result.winner === result.teamBName || result.winner === 'TIM B');

    if (isDraw) {
      if (trophyEl) trophyEl.textContent = '🤝';
      if (titleEl) titleEl.textContent = 'Pertandingan Seri!';
      if (winnerEl) winnerEl.textContent = 'Sama-Sama Hebat!';
      if (quoteEl) quoteEl.textContent = 'Kedua tim bertarung dengan sangat sengit dan memperoleh skor yang seimbang!';
      if (badgeEl) {
        badgeEl.textContent = 'HASIL SERI';
        badgeEl.classList.add('badge-draw');
      }
    } else {
      if (titleEl) titleEl.textContent = 'Juara Tarik Tambang!';
      if (winnerEl) winnerEl.textContent = result.winner;
      if (quoteEl) quoteEl.textContent = `Selamat kepada ${result.winner}! Strategi cepat dan jawaban tepat membawa kemenangan gemilang! 🎉`;
      if (badgeEl) badgeEl.textContent = 'JUARA PERTANDINGAN';
      createConfetti();
    }

    // Tampilkan kartu pertarungan (Versus battle arena)
    if (scoresDiv) {
      scoresDiv.innerHTML = `
      <div class="team-card team-card-a ${isTeamAWinner ? 'is-winner' : (isDraw ? 'is-draw' : 'is-runner')}">
        ${isTeamAWinner ? '<div class="crown-badge">👑 JUARA 1</div>' : (isDraw ? '<div class="crown-badge draw-badge">🤝 SERI</div>' : '<div class="runner-badge">RUNNER UP</div>')}
        <div class="team-avatar">🔴</div>
        <h3 class="team-title">${result.teamAName || 'Tim A'}</h3>
        <div class="score-box">
          <span class="score-label">Skor Akhir</span>
          <span class="score-value">${result.teamAScore ?? 0}</span>
        </div>
      </div>

      <div class="vs-badge-wrapper">
        <span class="vs-circle">VS</span>
      </div>

      <div class="team-card team-card-b ${isTeamBWinner ? 'is-winner' : (isDraw ? 'is-draw' : 'is-runner')}">
        ${isTeamBWinner ? '<div class="crown-badge">👑 JUARA 1</div>' : (isDraw ? '<div class="crown-badge draw-badge">🤝 SERI</div>' : '<div class="runner-badge">RUNNER UP</div>')}
        <div class="team-avatar">🔵</div>
        <h3 class="team-title">${result.teamBName || 'Tim B'}</h3>
        <div class="score-box">
          <span class="score-label">Skor Akhir</span>
          <span class="score-value">${result.teamBScore ?? 0}</span>
        </div>
      </div>
    `;
  }

  // Tampilkan statistik pertandingan jika tersedia
  if (matchStatsDiv) {
    const totalScore = (result.teamAScore || 0) + (result.teamBScore || 0);
    const scoreDiff = Math.abs((result.teamAScore || 0) - (result.teamBScore || 0));
    const timeLeftFormatted =
      result.timeLeft !== undefined
        ? `${Math.floor(result.timeLeft / 60)}:${(result.timeLeft % 60).toString().padStart(2, '0')}`
        : '0:00';

    matchStatsDiv.innerHTML = `
      <div class="stat-pill">
        <span>⏱️</span>
        <span>Sisa Waktu: <strong>${timeLeftFormatted}</strong></span>
      </div>
      <div class="stat-pill">
        <span>🎯</span>
        <span>Total Poin: <strong>${totalScore}</strong></span>
      </div>
      <div class="stat-pill">
        <span>⚡</span>
        <span>Selisih Poin: <strong>${scoreDiff}</strong></span>
      </div>
    `;
  }
}

function createConfetti() {
  const colors = ['#f5576c', '#667eea', '#f093fb', '#FFD700', '#4CAF50', '#00f2fe', '#ff9800'];
  const shapes = ['circle', 'square', 'ribbon'];

  for (let i = 0; i < 70; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';

      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.floor(Math.random() * 8) + 8; // 8px to 16px

      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = color;
      confetti.style.animationDuration = Math.random() * 2 + 2.5 + 's';

      if (shape === 'circle') {
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.borderRadius = '50%';
      } else if (shape === 'ribbon') {
        confetti.style.width = size * 0.4 + 'px';
        confetti.style.height = size * 1.8 + 'px';
        confetti.style.borderRadius = '2px';
      } else {
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.borderRadius = '3px';
      }

      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }, i * 40);
  }
}
