// start-countdown.js
(function () {
  if (window.__countdownInstalled) return;
  window.__countdownInstalled = true;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else fn();
  }

  ready(() => {
    let startBtn = document.getElementById("start-btn");
    let countdown = document.getElementById("countdown");

    if (!startBtn) {
      startBtn = document.createElement("button");
      startBtn.id = "start-btn";
      startBtn.className = "start-btn";
      startBtn.textContent = "Mulai";
      document.body.appendChild(startBtn);
    }

    if (!countdown) {
      countdown = document.createElement("div");
      countdown.id = "countdown";
      countdown.className = "countdown";
      document.body.appendChild(countdown);
    }

    // Jika game belum siap (misal sedang memuat data soal), tunggu hingga ready
    if (!window.__gameReady) {
      startBtn.disabled = true;
      startBtn.style.opacity = "0.7";
      startBtn.textContent = "Memuat...";

      window.__onGameReady = () => {
        startBtn.disabled = false;
        startBtn.style.opacity = "1";
        startBtn.textContent = "Mulai";
      };
    }

    startBtn.addEventListener("click", () => {
      if (startBtn.disabled) return;
      startBtn.style.display = "none";
      startCountdown();
    });

    function startCountdown() {
      // Urutan hitung mundur yang benar: 3 -> 2 -> 1 -> Mulai!
      const seq = ["3", "2", "1", "Mulai!"];
      let i = 0;

      countdown.style.display = "block";
      countdown.textContent = seq[i];

      const interval = setInterval(() => {
        i++;
        if (i < seq.length) {
          countdown.textContent = seq[i];
        } else {
          clearInterval(interval);
          setTimeout(() => {
            countdown.style.display = "none";
            runRealGame();
          }, 400);
        }
      }, 1000);
    }

    // Jalankan game
    function runRealGame() {
      if (window.__gameStarted) return;
      window.__gameStarted = true;

      if (typeof window.startGame === "function") {
        window.startGame();
      }
    }
  });
})();
