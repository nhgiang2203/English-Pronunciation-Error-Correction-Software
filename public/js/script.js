let currentRecorder = null;
let currentChunks = [];
let currentStream = null;

const audioBlobs = {};  

function startRecording(type, index) {
  const startBtn = document.getElementById(`start-btn-${type}-${index}`);
  const stopBtn = document.getElementById(`stop-btn-${type}-${index}`);
  const uploadBtn = document.getElementById(`upload-btn-${type}-${index}`);

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      currentStream = stream;
      currentRecorder = new MediaRecorder(stream);
      currentChunks = [];

      currentRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) currentChunks.push(e.data);
      };

      currentRecorder.onstop = () => {
        const blob = new Blob(currentChunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(blob);
        document.getElementById(`${type}-audio-${index}`).src = audioURL;

        audioBlobs[`${type}-${index}`] = blob; // lưu riêng cho từng câu

        uploadBtn.disabled = false;

        currentStream.getTracks().forEach(track => track.stop());
        currentRecorder = null;
        currentStream = null;
      };

      currentRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      uploadBtn.disabled = true;
    })
    .catch(err => {
      alert("Không thể truy cập micro: " + err.message);
    });
}

function stopRecording(type, index) {
  const startBtn = document.getElementById(`start-btn-${type}-${index}`);
  const stopBtn = document.getElementById(`stop-btn-${type}-${index}`);

  if (currentRecorder && currentRecorder.state === "recording") {
    currentRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

function uploadAudio(type, index) {
  const uploadBtn = document.getElementById(`upload-btn-${type}-${index}`);
  uploadBtn.textContent = "⬆️ Đang gửi...";
  uploadBtn.disabled = true;

  const blob = audioBlobs[`${type}-${index}`];
  const inputText = document.getElementById(`text-${type}-${index}`).textContent.trim();

  if (!blob || !inputText) {
    alert("Thiếu audio hoặc text gốc!");
    uploadBtn.textContent = "⬆️ Gửi";
    uploadBtn.disabled = false;
    return;
  }

  const formData = new FormData();
  formData.append("audio", blob, `${type}-${index}.webm`);
  formData.append("text", inputText);  // gửi câu gốc từ UI

  fetch("http://127.0.0.1:5000/part1", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      const resultDiv = document.getElementById(`${type}-result-${index}`);

      let highlightedIPA = "";
      let errorIndex = 0;

      for (let i = 0; i < data.label_ipa.length; i++) {
        const ch = data.label_ipa[i];
        if (ch === " ") {
          highlightedIPA += " ";
        } else {
          const isError = data.error_char_indexes[errorIndex] === false;
          highlightedIPA += `<span style="color: ${isError ? 'red' : 'green'}; font-weight: bold;">${ch}</span>`;
          errorIndex++;  // chỉ tăng nếu không phải space
        }
      }


      // Hiển thị điểm từng từ
      let wordScoresHTML = "";
      data.word_scores.forEach((score, i) => {
        let color = score >= 0.8 ? 'green' : score >= 0.5 ? 'orange' : 'red';
        wordScoresHTML += `<span style="margin-right:10px; font-weight:bold; color:${color}">[${score}]</span>`;
      });

      // Highlight từng từ trong câu gốc theo điểm
      const words = data.text.split(" ");
      let highlightedSentence = "";
      words.forEach((word, i) => {
        const score = data.word_scores[i];
        let color = score >= 0.8 ? 'green' : score >= 0.5 ? 'orange' : 'red';
        highlightedSentence += `<span style="color:${color}; font-weight:bold; margin-right:5px">${word}</span>`;
      });

      resultDiv.innerHTML = `
      <div class="mt-2 border rounded p-2 bg-light">
        <div><strong>Câu gốc:</strong> ${highlightedSentence}</div>
        <div><strong>IPA:</strong> ${highlightedIPA}</div>
        <div><strong>Điểm tổng:</strong> <span class="badge bg-${data.score >= 0.8 ? 'success' : data.score >= 0.5 ? 'warning' : 'danger'}">${data.score}</span></div>
      </div>
    
      `;
      uploadBtn.textContent = "⬆️ Gửi lại";
    })
    .catch(err => {
      alert("Gửi thất bại: " + err.message);
      uploadBtn.textContent = "⬆️ Gửi";
    })
    .finally(() => {
      uploadBtn.disabled = false;
    });
}

function playAudio(url) {
  const audio = new Audio(url);
  audio.play();
}

function uploadAudioPrac(type, index) {
  const uploadBtn = document.getElementById(`upload-btn-${type}-${index}`);
  uploadBtn.textContent = "⬆️ Đang gửi...";
  uploadBtn.disabled = true;

  const blob = audioBlobs[`${type}-${index}`];
  const inputTextElem = document.getElementById(`text-${type}-${index}`);
  const inputText = inputTextElem ? inputTextElem.textContent.trim() : "";

  if (!blob || !inputText) {
    alert("Thiếu audio hoặc text gốc!");
    uploadBtn.textContent = "⬆️ Gửi";
    uploadBtn.disabled = false;
    return;
  }

  const formData = new FormData();
  formData.append("audio", blob, `${type}-${index}.webm`);
  formData.append("text", inputText);

  fetch("http://127.0.0.1:5000/part2", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      const resultDiv = document.getElementById(`${type}-result-${index}`);
      if (!resultDiv) return;

      let highlightedIPA = "";
      let errorIndex = 0;

      for (let i = 0; i < data.label_ipa.length; i++) {
        const ch = data.label_ipa[i];
        if (ch === " ") {
          highlightedIPA += " ";
        } else {
          const isError = data.error_char_indexes[errorIndex] === false;
          highlightedIPA += `<span style="color: ${isError ? 'red' : 'green'}; font-weight: bold;">${ch}</span>`;
          errorIndex++;
        }
      }

      let wordScoresHTML = "";
      data.word_scores.forEach((score) => {
        let color = score >= 0.8 ? 'green' : score >= 0.5 ? 'orange' : 'red';
        wordScoresHTML += `<span style="margin-right:10px; font-weight:bold; color:${color}">[${score}]</span>`;
      });

      const words = data.text.split(" ");
      let highlightedSentence = "";
      words.forEach((word, i) => {
        const score = data.word_scores[i];
        let color = score >= 0.8 ? 'green' : score >= 0.5 ? 'orange' : 'red';
        highlightedSentence += `<span style="color:${color}; font-weight:bold; margin-right:5px">${word}</span>`;
      });

      resultDiv.innerHTML = `
        <div class="mt-2 border rounded p-2 bg-light">
          <div><strong>Câu gốc:</strong> ${highlightedSentence}</div>
          <div><strong>IPA:</strong> ${highlightedIPA}</div>
          <div><strong>Điểm tổng:</strong> <span class="badge bg-${data.score >= 0.8 ? 'success' : data.score >= 0.5 ? 'warning' : 'danger'}">${data.score}</span></div>
        </div>
      `;

      uploadBtn.textContent = "⬆️ Gửi lại";
    })
    .catch(err => {
      alert("Gửi thất bại: " + err.message);
      uploadBtn.textContent = "⬆️ Gửi";
    })
    .finally(() => {
      uploadBtn.disabled = false;
    });
}


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



