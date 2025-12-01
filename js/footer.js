document.addEventListener('DOMContentLoaded', () => {
  const footerContainer = document.getElementById('footer-container');

  if (footerContainer) {
    fetch('footer.html')
      .then((response) => response.text())
      .then((data) => {
        footerContainer.innerHTML = data;
      })
      .catch((err) => {
        console.error('Gagal memuat footer:', err);
      });
  }
});
