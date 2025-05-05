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
  const questionText = uploadBtn.getAttribute("data-question") || "";
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

async function uploadAudioPrac(type, index) {
  const uploadBtn = document.getElementById(`upload-btn-${type}-${index}`);
  const inputText = getInputText(type, index);
  const resultDiv = document.getElementById(`${type}-result-${index}`);
  const blob = audioBlobs[`${type}-${index}`];
  const questionText = document.getElementById(`question-${type}-${index}`)?.textContent || "";

  uploadBtn.textContent = "⬆️ Đang gửi...";
  uploadBtn.disabled = true;

  if (!blob || !inputText || !resultDiv) {
    alert("Thiếu audio hoặc text gốc!");
    resetUploadBtn(uploadBtn);
    return;
  }

  try {
    const data = await sendAudioAndText(blob, inputText, type, index);
    renderPronunciationFeedback(resultDiv, data);

    // Thêm nút phân tích nâng band
    const improveBtn = document.createElement("button");
    improveBtn.textContent = "💡 Phân tích & gợi ý?";
    improveBtn.className = "btn btn-sm btn-outline-success mt-2";
    improveBtn.onclick = () => showImproveForm(resultDiv, inputText, questionText, type, index);
    resultDiv.appendChild(improveBtn);
  } catch (err) {
    alert("Gửi thất bại: " + err.message);
    resetUploadBtn(uploadBtn);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "⬆️ Gửi lại";
  }
}

function getInputText(type, index) {
  const inputTextElem = document.getElementById(`text-${type}-${index}`);
  return inputTextElem ? inputTextElem.textContent.trim() : "";
}

function resetUploadBtn(button) {
  button.textContent = "⬆️ Gửi";
  button.disabled = false;
}

async function sendAudioAndText(blob, text, type, index) {
  const formData = new FormData();
  formData.append("audio", blob, `${type}-${index}.webm`);
  formData.append("text", text);

  const res = await fetch("http://127.0.0.1:5000/part2", {
    method: "POST",
    body: formData
  });

  return res.json();
}

function renderPronunciationFeedback(resultDiv, data) {
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

  const words = data.text.split(" ");
  let highlightedSentence = "";
  data.word_scores.forEach((score, i) => {
    const color = score >= 0.8 ? 'green' : score >= 0.5 ? 'orange' : 'red';
    highlightedSentence += `<span style="color:${color}; font-weight:bold; margin-right:5px">${words[i]}</span>`;
  });

  // Lưu lại câu trả lời gốc để hiển thị trong form chỉnh sửa
  resultDiv.dataset.originalAnswer = data.text;
  resultDiv.dataset.labelIpa = JSON.stringify(data.label_ipa);
  resultDiv.dataset.errorIndexes = JSON.stringify(data.error_char_indexes);
  resultDiv.dataset.wordScores = JSON.stringify(data.word_scores);
  resultDiv.dataset.highlightedSentence = highlightedSentence;
  resultDiv.dataset.highlightedIPA = highlightedIPA;
  resultDiv.dataset.score = data.score;


  resultDiv.innerHTML = `
  <div class="mt-2 border rounded p-2 bg-light">
    <div class="sentence-box">
      <div><strong>Câu gốc:</strong> ${highlightedSentence}</div>
      <div><strong>IPA:</strong> ${highlightedIPA}</div>
      <div><strong>Điểm tổng:</strong> 
        <span class="badge bg-${data.score >= 0.8 ? 'success' : data.score >= 0.5 ? 'warning' : 'danger'}">
          ${data.score}
        </span>
      </div>
    </div>
  </div>
`;

}


function showImproveForm(resultDiv, originalText, questionText, type, index) {
  const formId = `improve-form-${type}-${index}`;
  if (document.getElementById(formId)) return;

  // Lấy từ kết quả đánh giá, nếu không có thì dùng fallback
  const originalAnswer = resultDiv.dataset.originalAnswer || originalText;

  const form = document.createElement("div");
  form.className = "mt-3 border rounded p-2 bg-white";
  form.id = formId;

  form.innerHTML = `
    <label for="edit-answer-${type}-${index}" class="form-label">✏️ Sửa câu trả lời (nếu cần):</label>
    <textarea id="edit-answer-${type}-${index}" class="form-control mb-2" rows="3">${originalAnswer}</textarea>
    <button class="btn btn-primary btn-sm" onclick="analyzeWithLLM('${type}', ${index})">Gửi phân tích</button>
    <div id="llm-analysis-${type}-${index}" class="mt-3"></div>
  `;

  resultDiv.appendChild(form);
}


async function analyzeWithLLM(type, index) {
  const answerText = document.getElementById(`edit-answer-${type}-${index}`).value;
  const questionText = document.getElementById(`text-question-${index}`)?.textContent || "";
  const analysisDiv = document.getElementById(`llm-analysis-${type}-${index}`);
  const analyzeBtn = document.querySelector(`#edit-answer-${type}-${index} ~ button`);

  // Đổi text nút và disable
  analyzeBtn.textContent = "⏳ Đang phân tích...";
  analyzeBtn.disabled = true;

  const llmPrompt = `
    You are an IELTS speaking evaluator and English grammar expert. A student has answered an IELTS Speaking Part 1 question.

    Your tasks are:
    1. Identify grammar and vocabulary mistakes in the student's answer.
    2. Provide a corrected version of the answer, keeping the original structure and wording as much as possible. Only fix grammar and vocabulary errors without rephrasing the sentence unless absolutely necessary.
    3. Explain the grammar or vocabulary corrections you made. If there are no mistakes, say "No grammar mistakes".
    4. Evaluate whether the answer is appropriate and relevant to the question.
    5. Suggest a better version of the answer that would score Band higher (you can freely rephrase here).

    Return the result in this exact JSON format:
    {
      "grammar_explanation": "<detailed explanation of corrections or 'No grammar mistakes'>",
      "corrected_answer": "<the corrected version of the answer with same structure>",
      "relevance": "<evaluate how well the answer addresses the question>",
      "suggested_band_higher_answer": "<improved version for Band higher>"
    }

    Here is the input: Question: "${questionText}" 
    Student's answer: "${answerText}"
  `;

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mistral", prompt: llmPrompt, stream: false })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) responseText += json.response;
        } catch (err) {
          console.warn("Không parse được dòng JSON:", line);
        }
      }
    }

    const analysis = JSON.parse(responseText);

    // Hiển thị phân tích
    analysisDiv.innerHTML = `
      <div class="border rounded bg-light p-2">
        <div><strong>Sửa lỗi:</strong> ${analysis.grammar_explanation}</div>
        <div><strong>Câu sửa:</strong> ${analysis.corrected_answer}</div>
        <div><strong>Liên quan:</strong> ${analysis.relevance}</div>
        <div><strong>Gợi ý:</strong> ${analysis.suggested_band_higher_answer}</div>
      </div>
    `;

    // Sau khi phân tích xong, tạo nút Save
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-success btn-sm mt-3";
    saveBtn.textContent = "Lưu";

    saveBtn.onclick = async () => {
      const topic = document.getElementById("topicId").value;
      const userId = document.getElementById("userId").value;
      
      // Lấy pronunciationData từ kết quả cũ renderPronunciationFeedback (nếu cần)
      const resultDiv = document.getElementById(`${type}-result-${index}`);
      const pronunciationData = {
        highlighted_sentence: resultDiv.dataset.highlightedSentence || "",
        highlighted_ipa: resultDiv.dataset.highlightedIPA || "",
        answerOriginal: resultDiv.dataset.originalAnswer || "",
        score: resultDiv.dataset.score ? parseFloat(resultDiv.dataset.score) : 0
      };


      const suggestData = {
        grammar_explanation: analysis.grammar_explanation,
        corrected_answer: analysis.corrected_answer,
        relevance: analysis.relevance,
        suggested_band_higher_answer: analysis.suggested_band_higher_answer
      };

      const myAnswer = {
        topic,
        questionText,
        answerText,
        pronunciationData: pronunciationData,
        suggestData: suggestData
      };

      console.log(myAnswer);

      try {
        const saveRes = await fetch(`/user/my-answer/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(myAnswer)
        });

        const saveResult = await saveRes.json();
        if (saveResult.success) {
          alert("Đã lưu thành công!");
        } else {
          alert("Lưu thất bại!");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi server khi lưu!");
      }
    };

    analysisDiv.appendChild(saveBtn);

  } catch (err) {
    console.error(err);
    analysisDiv.innerHTML = `<div class="text-danger">Lỗi phân tích: ${err.message}</div>`;
  } finally {
    analyzeBtn.textContent = "Gửi phân tích";
    analyzeBtn.disabled = false;
  }
}


