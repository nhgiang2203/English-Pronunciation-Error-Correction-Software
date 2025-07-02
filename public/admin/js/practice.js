let qIndex = parseInt(document.getElementById('initialData').dataset.qindex) || 0;

function addQuestionRow() {
  const tbody = document.getElementById('questionTableBody');
  const currentIndex = qIndex++;
  const row = document.createElement('tr');

  row.innerHTML = `
    <td class="align-middle index-col"></td>
    <td>
      <textarea
        class="form-control"
        id="question-${currentIndex}"
        textarea-mce
        name="questions[${currentIndex}][text]"
        rows="5"
      ></textarea>

      <div class="d-flex gap-2 mt-2">
        <input type="file" class="form-control" name="questions[${currentIndex}][audioFile]" accept="audio/*" />
        <button type="button" class="btn btn-secondary btn-sm" onclick="generateTTS(this, 'question', ${currentIndex})">Tự sinh audio</button>
      </div>

      <audio controls class="mt-2 d-none"></audio>
    </td>
    <td class="text-center">
      <button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;

  tbody.appendChild(row);
  updateRowNumbers();
  initTinyMCE();
}


function removeRow(button) {
  const row = button.closest('tr');
  row.remove();
  updateRowNumbers();
}

function updateRowNumbers() {
  const rows = document.querySelectorAll('#questionTableBody tr');
  rows.forEach((row, index) => {
    row.querySelector('.index-col').innerText = index + 1;
  });
}

function generateTTS(button, type, index) {
  const cell = button.closest('td');
  const textareaId = `${type}-${index}`;
  let text = '';

  if (tinymce.get(textareaId)) {
    text = tinymce.get(textareaId).getContent({ format: 'text' }).trim();
  } else {
    const textarea = cell.querySelector(`#${textareaId}`);
    text = textarea?.value.trim() || '';
  }

  if (!text) {
    alert("Vui lòng nhập nội dung trước khi sinh audio.");
    return;
  }

  button.disabled = true;
  button.innerText = "Đang sinh...";

  const formData = new FormData();
  formData.append("text", text);
  formData.append("type", "question");
  formData.append("index", index);
  formData.append("topic", "practice"); 

  fetch("http://127.0.0.1:5000/tts", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.url) {
        const existing = cell.querySelector(`input[name="questions[${index}][audio]"]`);
        if (existing) existing.remove();
      
        const hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = `questions[${index}][audio]`;
        hidden.value = data.url;
        cell.appendChild(hidden);
      
        const audio = cell.querySelector("audio");
        audio.src = data.url;
        audio.classList.remove("d-none");
        audio.load();
      }else {
        alert("Có lỗi xảy ra khi sinh audio");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Lỗi kết nối đến server.");
    })
    .finally(() => {
      button.disabled = false;
      button.innerText = "Tự sinh audio";
    });
}
