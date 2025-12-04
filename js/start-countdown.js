// start-countdown.js
// Add-on aman, tidak mengubah kode asli game.js.

(function () {
  if (window.__countdownInstalled) return;
  window.__countdownInstalled = true;

  // ========== 1. CEGAH GAME JALAN OTOMATIS ==========
  // Kita intercept fungsi original, tapi tidak menghapusnya.
  // Kita simpan dulu di variable agar tidak hilang.

  const originalStartGame = window.startGame;
  const originalRenderQuestion = window.renderQuestion;
  const originalStartTimer = window.startTimer;

  // Kita blok panggilan awal dari game.js:
  window.startGame = function () {};
  window.renderQuestion = function () {};
  window.startTimer = function () {};

  // ========== 2. TOMBOL & COUNTDOWN ==========
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

    startBtn.addEventListener("click", () => {
      startBtn.style.display = "none";
      startCountdown();
    });

    function startCountdown() {
      const seq = ["1", "2", "3", "Mulai!"];
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

    // ========== 3. JALANKAN GAME ASLINYA ==========
    function runRealGame() {
      if (window.__gameStarted) return;
      window.__gameStarted = true;

      // Kembalikan fungsi original
      if (originalStartGame) window.startGame = originalStartGame;
      if (originalRenderQuestion) window.renderQuestion = originalRenderQuestion;
      if (originalStartTimer) window.startTimer = originalStartTimer;

      // Jalankan game seperti biasa
      try { if (originalStartGame) originalStartGame(); } catch (e) {}
      try { if (originalRenderQuestion) originalRenderQuestion("A"); } catch (e) {}
      try { if (originalRenderQuestion) originalRenderQuestion("B"); } catch (e) {}
      try { if (originalStartTimer) originalStartTimer(); } catch (e) {}
    }
  });
})();
