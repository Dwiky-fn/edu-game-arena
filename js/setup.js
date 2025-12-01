function populateFolderSelect() {
  const select = document.getElementById('folder-select');
  select.innerHTML = `<option value="">-- Pilih Folder --</option>`;
  const data = JSON.parse(localStorage.getItem('eduGameData') || '{}');
  if (data.folders) {
    data.folders.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.nama_folder;
      select.appendChild(opt);
    });
  }
}

function startGame() {
  const teamA = document.getElementById('team-a-name').value.trim();
  const teamB = document.getElementById('team-b-name').value.trim();
  const folderId = document.getElementById('folder-select').value;
  if (!teamA || !teamB || !folderId) {
    alert('Isi semua data!');
    return;
  }

  const data = JSON.parse(localStorage.getItem('eduGameData') || '{}');
  const folder = data.folders.find((f) => f.id === folderId);
  if (!folder || !folder.soal.length) {
    alert('Folder kosong!');
    return;
  }

  // simpan konfigurasi setup ke localStorage
  const setupData = {
    teamA,
    teamB,
    folderId,
  };
  localStorage.setItem('gameSetup', JSON.stringify(setupData));

  // pindah ke halaman game
  window.location.href = 'game.html';
}

populateFolderSelect();
