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
      <input type="file" class="form-control mt-2" name="questions[${currentIndex}][audio]" accept="audio/*" />
    </td>
    <td>
      <textarea
        class="form-control"
        id="answer-${currentIndex}"
        textarea-mce
        name="answers[${currentIndex}][text]"
        rows="5"
      ></textarea>
      <input type="file" class="form-control mt-2" name="answers[${currentIndex}][audio]" accept="audio/*" />
    </td>
    <td class="text-center">
      <button type="button" class="btn btn-danger btn-sm" onclick="removeRow(this)">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;

  tbody.appendChild(row);
  updateRowNumbers();
  initTinyMCE(); // để TinyMCE attach vào textarea mới
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

// Lấy dữ liệu của TinyMCE khi submit form
// function getFormData() {
//   const allEditors = tinyMCE.editors;
//   allEditors.forEach(editor => {
//     const content = editor.getContent();
//     const textarea = document.getElementById(editor.id);
//     if (textarea) {
//       textarea.value = content;
//     }
//   });
// }


// // Khi gửi form
// document.querySelector('form').addEventListener('submit', function (event) {
//   getFormData(); // Trước khi gửi form, lấy dữ liệu TinyMCE
// });



