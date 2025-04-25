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


// // Confirm password
// const registerForm = document.getElementById('register-form');
// if (registerForm) {
//   registerForm.addEventListener('submit', function (e) {
//     const password = registerForm.querySelector('input[name="password"]').value;
//     const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;
//     const errorMsg = document.getElementById('error-message');

//     if (password !== confirmPassword) {
//       e.preventDefault();
//       errorMsg.textContent = "❌ Password do not match!";
//       errorMsg.style.display = "block";
//     } else {
//       errorMsg.style.display = "none";
//     }
//   });
// }



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


