const listTextareaMCE = document.querySelectorAll("[textarea-mce]");

if (listTextareaMCE.length > 0) {
  listTextareaMCE.forEach((textarea) => {
    const id = textarea.id;
    tinymce.init({
      selector: `#${id}`,
      plugins: "image code",
      image_title: true,
      automatic_uploads: true,
      file_picker_types: "image",

      // Callback chọn file ảnh từ máy
      file_picker_callback: function (cb, value, meta) {
        if (meta.filetype === 'image') {
          var input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');

          input.onchange = function () {
            var file = this.files[0];

            var reader = new FileReader();
            reader.onload = function () {
              var id = 'blobid' + (new Date()).getTime();
              var blobCache = tinymce.activeEditor.editorUpload.blobCache;
              var base64 = reader.result.split(',')[1];
              var blobInfo = blobCache.create(id, file, base64);
              blobCache.add(blobInfo);

              cb(blobInfo.blobUri(), { title: file.name });
            };
            reader.readAsDataURL(file);
          };

          input.click();
        }
      }
    });
  });
}
