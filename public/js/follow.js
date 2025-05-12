document.addEventListener('DOMContentLoaded', function () {
  const followBtn = document.getElementById('followBtn');
  if (!followBtn) return;

  followBtn.addEventListener('click', async function () {
    const userId = followBtn.getAttribute('data-user-id');

    try {
      const response = await fetch('/user/isFollowing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIdFollow: userId })
      });

      const result = await response.json();

      if (response.ok) {
        location.reload();
      } else {
        alert(result.message || 'Lỗi!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối với máy chủ!');
    }
  });
});
