let currentFolderId = null;
let editingFolderId = null;
let editingQuestionId = null;

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function initializeData() {
  if (!localStorage.getItem('eduGameData')) {
    const initialData = {
      folders: [
        {
          id: generateUUID(),
          nama_folder: 'Materi Surga dan Neraka',
          soal: [
            {
              id: generateUUID(),
              pertanyaan: 'Siapa yang akan masuk surga?',
              opsi_a: 'Orang yang beriman dan beramal sholeh',
              opsi_b: 'Orang kaya',
              opsi_c: 'Orang pintar',
              opsi_d: 'Semua manusia',
              jawaban_benar: 'A',
            },
          ],
        },
      ],
    };
    localStorage.setItem('eduGameData', JSON.stringify(initialData));
  }
}

function loadData() {
  const data = localStorage.getItem('eduGameData');
  return data ? JSON.parse(data) : { folders: [] };
}

function saveData(data) {
  localStorage.setItem('eduGameData', JSON.stringify(data));
}

function showFolders() {
  currentFolderId = null;
  document.getElementById('folders-view').style.display = 'block';
  document.getElementById('questions-view').style.display = 'none';
  document.getElementById('breadcrumb-folder').style.display = 'none';
  document.getElementById('add-btn').textContent = '➕ Tambah Folder';
  document.getElementById('add-btn').onclick = showAddFolderModal;
  renderFolders();
}

function renderFolders() {
  const data = loadData();
  const container = document.getElementById('folders-container');

  if (data.folders.length === 0) {
    container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <div class="empty-state-icon">📂</div>
                        <h3>Belum ada folder soal</h3>
                        <p>Klik "Tambah Folder" untuk membuat folder pertama</p>
                    </div>
                `;
    return;
  }

  container.innerHTML = data.folders
    .map(
      (folder) => `
                <div class="folder-card" onclick="openFolder('${folder.id}')">
                    <div class="folder-actions" onclick="event.stopPropagation()">
                        <button class="action-btn" onclick="editFolder('${folder.id}')" title="Edit">✏️</button>
                        <button class="action-btn" onclick="deleteFolder('${folder.id}')" title="Hapus">🗑️</button>
                    </div>
                    <div class="folder-icon">📁</div>
                    <div class="folder-name">${folder.nama_folder}</div>
                    <div class="folder-count">${folder.soal.length} soal</div>
                </div>
            `
    )
    .join('');
}

function openFolder(folderId) {
  currentFolderId = folderId;
  const data = loadData();
  const folder = data.folders.find((f) => f.id === folderId);

  document.getElementById('current-folder-name').textContent =
    folder.nama_folder;
  document.getElementById('breadcrumb-folder').style.display = 'inline';
  document.getElementById('folders-view').style.display = 'none';
  document.getElementById('questions-view').style.display = 'block';
  document.getElementById('add-btn').textContent = '➕ Tambah Soal';
  document.getElementById('add-btn').onclick = showAddQuestionModal;

  renderQuestions(folder);
}

function renderQuestions(folder) {
  const container = document.getElementById('questions-container');

  if (folder.soal.length === 0) {
    container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <h3>Belum ada soal</h3>
                        <p>Klik "Tambah Soal" untuk membuat soal pertama</p>
                    </div>
                `;
    return;
  }

  container.innerHTML = folder.soal
    .map(
      (q, index) => `
                <div class="question-card">
                    <div class="question-header">
                        <div class="question-text">${index + 1}. ${
        q.pertanyaan
      }</div>
                        <div class="question-actions">
                            <button class="action-btn" onclick="editQuestion('${
                              q.id
                            }')" title="Edit">✏️</button>
                            <button class="action-btn" onclick="deleteQuestion('${
                              q.id
                            }')" title="Hapus">🗑️</button>
                        </div>
                    </div>
                    <div class="options-grid">
                        <div class="option ${
                          q.jawaban_benar === 'A' ? 'correct' : ''
                        }">A. ${q.opsi_a}</div>
                        <div class="option ${
                          q.jawaban_benar === 'B' ? 'correct' : ''
                        }">B. ${q.opsi_b}</div>
                        <div class="option ${
                          q.jawaban_benar === 'C' ? 'correct' : ''
                        }">C. ${q.opsi_c}</div>
                        <div class="option ${
                          q.jawaban_benar === 'D' ? 'correct' : ''
                        }">D. ${q.opsi_d}</div>
                    </div>
                </div>
            `
    )
    .join('');
}

function showAddFolderModal() {
  editingFolderId = null;
  document.getElementById('folder-modal-title').textContent =
    'Tambah Folder Baru';
  document.getElementById('folder-name').value = '';
  document.getElementById('folder-modal').classList.add('active');
}

function editFolder(folderId) {
  editingFolderId = folderId;
  const data = loadData();
  const folder = data.folders.find((f) => f.id === folderId);

  document.getElementById('folder-modal-title').textContent = 'Edit Folder';
  document.getElementById('folder-name').value = folder.nama_folder;
  document.getElementById('folder-modal').classList.add('active');
}

function closeFolderModal() {
  document.getElementById('folder-modal').classList.remove('active');
}

function saveFolderData() {
  const folderName = document.getElementById('folder-name').value.trim();

  if (!folderName) {
    alert('Nama folder harus diisi!');
    return;
  }

  const data = loadData();

  if (editingFolderId) {
    const folder = data.folders.find((f) => f.id === editingFolderId);
    folder.nama_folder = folderName;
  } else {
    data.folders.push({
      id: generateUUID(),
      nama_folder: folderName,
      soal: [],
    });
  }

  saveData(data);
  closeFolderModal();
  renderFolders();
}

function deleteFolder(folderId) {
  if (
    !confirm(
      'Apakah Anda yakin ingin menghapus folder ini beserta seluruh soalnya?'
    )
  ) {
    return;
  }

  const data = loadData();
  data.folders = data.folders.filter((f) => f.id !== folderId);
  saveData(data);
  renderFolders();
}

function showAddQuestionModal() {
  editingQuestionId = null;
  document.getElementById('question-modal-title').textContent =
    'Tambah Soal Baru';
  document.getElementById('question-text').value = '';
  document.getElementById('option-a').value = '';
  document.getElementById('option-b').value = '';
  document.getElementById('option-c').value = '';
  document.getElementById('option-d').value = '';
  document.getElementById('correct-answer').value = 'A';
  document.getElementById('question-modal').classList.add('active');
}

function editQuestion(questionId) {
  editingQuestionId = questionId;
  const data = loadData();
  const folder = data.folders.find((f) => f.id === currentFolderId);
  const question = folder.soal.find((q) => q.id === questionId);

  document.getElementById('question-modal-title').textContent = 'Edit Soal';
  document.getElementById('question-text').value = question.pertanyaan;
  document.getElementById('option-a').value = question.opsi_a;
  document.getElementById('option-b').value = question.opsi_b;
  document.getElementById('option-c').value = question.opsi_c;
  document.getElementById('option-d').value = question.opsi_d;
  document.getElementById('correct-answer').value = question.jawaban_benar;
  document.getElementById('question-modal').classList.add('active');
}

function closeQuestionModal() {
  document.getElementById('question-modal').classList.remove('active');
}

function saveQuestionData() {
  const questionText = document.getElementById('question-text').value.trim();
  const optionA = document.getElementById('option-a').value.trim();
  const optionB = document.getElementById('option-b').value.trim();
  const optionC = document.getElementById('option-c').value.trim();
  const optionD = document.getElementById('option-d').value.trim();
  const correctAnswer = document.getElementById('correct-answer').value;

  if (!questionText || !optionA || !optionB || !optionC || !optionD) {
    alert('Semua field harus diisi!');
    return;
  }

  const data = loadData();
  const folder = data.folders.find((f) => f.id === currentFolderId);

  if (editingQuestionId) {
    const question = folder.soal.find((q) => q.id === editingQuestionId);
    question.pertanyaan = questionText;
    question.opsi_a = optionA;
    question.opsi_b = optionB;
    question.opsi_c = optionC;
    question.opsi_d = optionD;
    question.jawaban_benar = correctAnswer;
  } else {
    folder.soal.push({
      id: generateUUID(),
      pertanyaan: questionText,
      opsi_a: optionA,
      opsi_b: optionB,
      opsi_c: optionC,
      opsi_d: optionD,
      jawaban_benar: correctAnswer,
    });
  }

  saveData(data);
  closeQuestionModal();
  openFolder(currentFolderId);
}

function deleteQuestion(questionId) {
  if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
    return;
  }

  const data = loadData();
  const folder = data.folders.find((f) => f.id === currentFolderId);
  folder.soal = folder.soal.filter((q) => q.id !== questionId);
  saveData(data);
  openFolder(currentFolderId);
}

initializeData();
renderFolders();
