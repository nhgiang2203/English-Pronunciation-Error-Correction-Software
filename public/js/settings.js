const sendOtpBtn = document.getElementById('sendOtpBtn');
if (sendOtpBtn) {
  sendOtpBtn.addEventListener('click', function () {
    document.querySelector('.form-group-otp').style.display = 'block';
    const id = document.querySelector('input[name="id"]').value;
    const email = document.querySelector('input[name="email"]').value;

    fetch(`/user/otp/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert('OTP has been sent to your email!');
        } else {
          alert('Failed to send OTP. Please try again.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('An error occurred while sending OTP.');
      });
  });
}



const verifyOtpBtn = document.getElementById('verifyOtpBtn');
if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener('click', function (event) {
    event.preventDefault();
    const otp = document.querySelector('input[name="otp"]').value;
    const email = document.querySelector('input[name="email"]').value;

    fetch(`/user/verify/${email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ otp })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          alert('OTP verified successfully!');
          location.reload();
        } else {
          alert('Incorrect OTP. Please try again.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('An error occurred during OTP verification.');
      });
  });
}

const form = document.querySelector('form');
const tabInput = document.getElementById('tabInput'); // đảm bảo đúng ID

// Khi click vào tab
document.querySelectorAll('.account-settings-links a').forEach(function(tabLink) {
  tabLink.addEventListener('click', function(e) {
    e.preventDefault(); 
    const tabId = this.getAttribute('href').substring(1);

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({}, '', url);

    // Update UI
    document.querySelectorAll('.account-settings-links a').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active', 'show'));

    this.classList.add('active');
    const tabPane = document.getElementById(tabId);
    if (tabPane) tabPane.classList.add('active', 'show');

    // Cập nhật input hidden
    if (tabInput) {
      tabInput.value = tabId;
    }
  });
});

// Khi trang load
window.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const tabId = urlParams.get('tab');

  if (tabId) {
    const activeLink = document.querySelector(`.account-settings-links a[href="#${tabId}"]`);
    const activePane = document.getElementById(tabId);

    if (activeLink && activePane) {
      document.querySelectorAll('.account-settings-links a').forEach(link => link.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active', 'show'));

      activeLink.classList.add('active');
      activePane.classList.add('active', 'show');
    }

    if (tabInput) {
      tabInput.value = tabId;
    }
  }
});


form?.addEventListener('submit', () => {
  const activeLink = document.querySelector('.account-settings-links a.active');
  const tabId = activeLink?.getAttribute('href')?.substring(1);
  if (tabInput && tabId) {
    tabInput.value = tabId;
  }
});
