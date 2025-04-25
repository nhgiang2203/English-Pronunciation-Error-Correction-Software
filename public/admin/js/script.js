// Show preview image
const uploadImage = document.querySelector('[upload-image]');
if(uploadImage){
  const uploadImageInput = uploadImage.querySelector('[upload-image-input]');
  const uploadImagePreview = uploadImage.querySelector('[upload-image-preview]');

  uploadImageInput.addEventListener('change', (e) => {
    if(e.target.files.length){
      const image = URL.createObjectURL(e.target.files[0]);
      uploadImagePreview.src=image;
    }
  })
}

document.querySelectorAll('.sidebar-link.has-dropdown').forEach(toggle => {
  toggle.addEventListener('click', function (e) {
    e.preventDefault();

    const targetSelector = this.getAttribute('data-bs-target');
    const dropdown = document.querySelector(targetSelector);
    const isOpen = dropdown.classList.contains('show');
    const icon = this.querySelector('.arrow-icon');

    if (isOpen) {
      dropdown.classList.remove('show');
      this.setAttribute('aria-expanded', 'false');
      if (icon) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      }
    } else {
      dropdown.classList.add('show');
      this.setAttribute('aria-expanded', 'true');
      if (icon) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      }
    }
  });
});


// Show alert
const showAlert = document.querySelector('[show-alert]');
if (showAlert) {
  const time = parseInt(showAlert.getAttribute('data-time'));
  const closeAlert = document.querySelector('[close-alert]');
  
  setTimeout(() => {
    showAlert.classList.add('alert-hidden');
  }, time);

  closeAlert.addEventListener('click', () => {
    showAlert.classList.add('alert-hidden');
  });
}

//Delete Item
const buttonDelete = document.querySelectorAll('[button-delete]');
if (buttonDelete.length > 0) {
    const formDelete = document.querySelector('#form-delete-item');
    const path = formDelete.getAttribute('data-path');

    buttonDelete.forEach(button => {
        button.addEventListener('click', () => {
            const isConfirm = confirm('Are you sure to delete this item ?');

            if(isConfirm) {
                const id = button.getAttribute('data-id');
                
                const action = `${path}/${id}?_method=DELETE`;
                console.log('Submitting delete to:', action);

                formDelete.action = action;

                formDelete.submit();
            }
        })
    })
}

function playAudio(url) {
  const audio = new Audio(url);
  audio.play();
}


let qIndex = 0;

function addQuestionRow() {
  const tbody = document.getElementById('questionTableBody');
  const row = document.createElement('tr');
  const currentIndex = qIndex++;

  row.innerHTML = `
    <td class="align-middle index-col"></td>
    <td>
      <textarea
      class="form-control"
      textarea-mce
      name="questions[${currentIndex}][text]"
      rows="5"
    ></textarea>
      <input type="file" class="form-control mt-2" name="questions[${currentIndex}][audio]" accept="audio/*" />
    </td>
    <td>
      <textarea
      class="form-control"
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

document.addEventListener("DOMContentLoaded", () => addQuestionRow());