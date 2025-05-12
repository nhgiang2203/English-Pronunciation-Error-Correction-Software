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

//search
const boxSearchCustom = document.querySelector('.box-search-custom');
if (boxSearchCustom) {
  const input = boxSearchCustom.querySelector("input[name='keyword']");
  const innerSuggest = boxSearchCustom.querySelector('.inner-suggest');
  const innerList = boxSearchCustom.querySelector('.inner-list');

  let debounceTimer;

  input.addEventListener('keyup', () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const keyword = input.value.trim();
      if (!keyword) {
        innerSuggest.classList.remove("show");
        innerList.innerHTML = "";
        return;
      }

      const link = `/search/suggest?keyword=${encodeURIComponent(keyword)}`;

      fetch(link)
        .then(res => res.json())
        .then(data => {
          if (data && data.code === 200) {
            const { samples, practices, part2s, users } = data;
            const allHtmls = [];

            // Part1 Samples
            if (samples.length > 0) {
              const htmls = samples.map(item => `
                <a class="inner-item" href="/part1/sample/${item.slug}">
                  <div class="inner-info">
                    <div class="inner-title">${item.title}</div>
                  </div>
                </a>
              `);
              allHtmls.push(...htmls);
            }

            // Part1 Practices
            if (practices.length > 0) {
              const htmls = practices.map(item => `
                <a class="inner-item" href="/part1/practice/${item.slug}">
                  <div class="inner-info">
                    <div class="inner-title">${item.title}</div>
                  </div>
                </a>
              `);
              allHtmls.push(...htmls);
            }

            // Part2
            if (part2s.length > 0) {
              const htmls = part2s.map(item => `
                <a class="inner-item" href="/part2/detail/${item.slug}">
                  <div class="inner-info">
                    <div class="inner-title">${item.title}</div>
                  </div>
                </a>
              `);
              allHtmls.push(...htmls);
            }

            // Users
            if (users.length > 0) {
              const htmls = users.map(item => `
                <a class="inner-item" href="/user/detail/${item.id}">
                  <div class="inner-image">
                    <img src="${item.avatar}" alt="${item.username}" />
                  </div>
                  <div class="inner-info">
                    <div class="inner-title">${item.username}</div>
                  </div>
                </a>
              `);
              allHtmls.push(...htmls);
            }

            // Show or hide suggestions
            if (allHtmls.length > 0) {
              innerList.innerHTML = allHtmls.join("");
              innerSuggest.classList.add("show");
            } else {
              innerList.innerHTML = "";
              innerSuggest.classList.remove("show");
            }
          }
        })
        .catch(err => {
          console.error('Suggest error:', err);
          innerSuggest.classList.remove("show");
        });
    }, 300); // debounce delay 300ms
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


