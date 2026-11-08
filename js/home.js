// home.js — Kontrol interaktivitas Beranda

function openInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeInfoModalOnOverlay(event) {
  if (event.target && event.target.id === 'info-modal') {
    closeInfoModal();
  }
}

// Kompatibilitas jika dipanggil dari luar
function showInfo() {
  openInfoModal();
}

// Tutup modal dengan tombol Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeInfoModal();
  }
});
