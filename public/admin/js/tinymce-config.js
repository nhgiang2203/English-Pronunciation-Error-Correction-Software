function initTinyMCE() {
  document.querySelectorAll('textarea[textarea-mce]').forEach((el) => {
    if (!el.classList.contains('mce-initialized')) {
      tinymce.init({
        target: el,
        plugins: "image code",
        image_title: true,
        automatic_uploads: true,
        file_picker_types: "image",
        setup: function (editor) {
          editor.on('init', function () {
            el.classList.add('mce-initialized');
          });
        },
        file_picker_callback: function (cb, value, meta) {
          if (meta.filetype === 'image') {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.onchange = function () {
              const file = this.files[0];
              const reader = new FileReader();
              reader.onload = function () {
                const id = 'blobid' + (new Date()).getTime();
                const blobCache = tinymce.activeEditor.editorUpload.blobCache;
                const base64 = reader.result.split(',')[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);
                cb(blobInfo.blobUri(), { title: file.name });
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }
        }
      });
    }
  });
}
