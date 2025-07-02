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

let currentAudio = null;

function playAudio(url) {
  // Nếu đã có audio đang phát và trùng URL => dừng lại
  if (currentAudio && !currentAudio.paused && currentAudio.src === url) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    return;
  }

  // Nếu đang phát audio khác => dừng lại
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Phát audio mới
  currentAudio = new Audio(url);
  currentAudio.play();
}


//Form search
const formSearch = document.querySelector('#form-search');
if(formSearch) {
    let url = new URL(window.location.href);

    formSearch.addEventListener('submit', (e) => {
        e.preventDefault();
        const keyword = e.target.elements.keyword.value;
        if (keyword){
            url.searchParams.set('keyword', keyword);
        }
        else {
            url.searchParams.delete('keyword');
        }

        window.location.href = url.href;
    })
}

//Pagination
const buttonPagination = document.querySelectorAll('[button-pagination]');

if (buttonPagination){
    let url = new URL(window.location.href);
    buttonPagination.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('button-pagination');
            url.searchParams.set('page', page);
            window.location.href = url.href;
        });
    });
}

//Arrage order
const sort = document.querySelector('[sort]');
if (sort){
    let url = new URL(window.location.href);

    const sortSelect = sort.querySelector('[sort-select]');
    const sortClear = sort.querySelector('[sort-clear]');

    sortSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        const [sortKey, sortValue] = value.split('-');

        url.searchParams.set('sortKey', sortKey);
        url.searchParams.set('sortValue', sortValue);

        window.location.href = url.href;
    });

    //Thêm selected cho option
    const sortKey = url.searchParams.get('sortKey');
    const sortValue = url.searchParams.get('sortValue');
    if (sortKey && sortValue) {
        const stringSort = `${sortKey}-${sortValue}`;
        const optionSelected = sortSelect.querySelector(`option[value='${stringSort}']`);
        optionSelected.selected = true;
    }

    //Clear order
    // sortClear.addEventListener('click', () => {
    //     url.searchParams.delete('sortKey');
    //     url.searchParams.delete('sortValue');

    //     window.location.href = url.href;
    // })

}

//Button status

const buttonsStatus = document.querySelectorAll('[button-status]');

if(buttonsStatus.length > 0) {
    let url = new URL(window.location.href);

    buttonsStatus.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.getAttribute('button-status');
            
            if (status){
                url.searchParams.set('status', status);
            }
            else {
                url.searchParams.delete('status');
            }

            //console.log(url.href);
            window.location.href = url.href;
  
            
        });
    })
}