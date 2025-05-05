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


// Show preview image
const uploadImage = document.querySelector('[upload-image]');
if (uploadImage) {
  const uploadImageInput = uploadImage.querySelector('[upload-image-input]');
  const avatarPreview = document.querySelector('#avatarPreview');

  uploadImageInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      const image = URL.createObjectURL(e.target.files[0]);
      avatarPreview.src = image;
    }
  });
}




document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.user-toggle');
  const dropdown = document.querySelector('.user-dropdown');

  if (toggleBtn && dropdown) {
    toggleBtn.addEventListener('click', () => {
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }
});


