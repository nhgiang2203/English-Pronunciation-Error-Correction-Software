let currentRecorder = null;
let currentChunks = [];
let currentStream = null;

const audioBlobs = {};

function startRecording(topicId) {
  const startBtn = document.getElementById(`start-btn-${topicId}`);
  const stopBtn = document.getElementById(`stop-btn-${topicId}`);
  const uploadBtn = document.getElementById(`upload-btn-${topicId}`);

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      currentStream = stream;
      currentRecorder = new MediaRecorder(stream);
      currentChunks = [];

      currentRecorder.ondataavailable = e => {
        if (e.data.size > 0) currentChunks.push(e.data);
      };

      currentRecorder.onstop = () => {
        const blob = new Blob(currentChunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(blob);
        document.getElementById(`audio-${topicId}`).src = audioURL;
        audioBlobs[`${topicId}`] = blob;

        uploadBtn.disabled = false;
        cleanupStream();
      };

      currentRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      uploadBtn.disabled = true;
    })
    .catch(err => alert("Không thể truy cập micro: " + err.message));
}

function stopRecording(topicId) {
  if (currentRecorder?.state === "recording") currentRecorder.stop();
  document.getElementById(`start-btn-${topicId}`).disabled = false;
  document.getElementById(`stop-btn-${topicId}`).disabled = true;
}

function cleanupStream() {
  currentStream?.getTracks().forEach(track => track.stop());
  currentRecorder = null;
  currentStream = null;
}

function createFormData(blob, text, topicId) {
  const formData = new FormData();
  formData.append("audio", blob, `${topicId}.webm`);
  formData.append("text", text);
  return formData;
}

function highlightIPA(labelIPA, errorIndexes) {
  let result = '', errorIdx = 0;
  for (const ch of labelIPA) {
    if (ch === ' ') {
      result += ' ';
    } else {
      const isError = errorIndexes[errorIdx] === false;
      result += `<span style="color:${isError ? 'red' : 'green'};font-weight:bold;">${ch}</span>`;
      errorIdx++;
    }
  }
  return result;
}

function highlightSentence(words, wordScores) {
  return words.map((word, i) => {
    const score = wordScores[i];
    const color = score >= 0.8 ? 'green' : score >= 0.5 ? 'orange' : 'red';
    return `<span style="color:${color};font-weight:bold;margin-right:5px">${word}</span>`;
  }).join('');
}

async function uploadAudioCommon(topicId, url) {
  const uploadBtn = document.getElementById(`upload-btn-${topicId}`);
  const resultDiv = document.getElementById(`answer-result-${topicId}`);
  if (!resultDiv) {
    alert(`Không tìm thấy vùng hiển thị kết quả cho topicId: ${topicId}`);
    resetUploadBtn(uploadBtn);
    return;
  }
  const textElem = document.getElementById(`text-topic-${topicId}`);
  const inputText = textElem?.textContent.trim();
  const blob = audioBlobs[`${topicId}`];

  uploadBtn.textContent = "⬆️ Đang gửi...";
  uploadBtn.disabled = true;

  if (!blob || !inputText) {
    alert("Thiếu audio hoặc text gốc!");
    resetUploadBtn(uploadBtn);
    return;
  }

  try {
    console.log(url);
    const res = await fetch(url, { method: "POST", body: createFormData(blob, inputText, topicId) });
    const data = await res.json();

    const highlightedIPA = highlightIPA(data.label_ipa, data.error_char_indexes);
    const highlightedSentence = highlightSentence(data.text.split(" "), data.word_scores);
    const badge = data.score >= 0.8 ? 'success' : data.score >= 0.5 ? 'warning' : 'danger';

    resultDiv.innerHTML = `
      <div class="mt-2 border rounded p-2 bg-light">
        <div><strong>Câu gốc:</strong> ${highlightedSentence}</div>
        <div><strong>IPA:</strong> ${highlightedIPA}</div>
        <div><strong>Điểm tổng:</strong> <span class="badge bg-${badge}">${data.score}</span></div>
      </div>
    `;

  
    Object.assign(resultDiv.dataset, {
      originalAnswer: data.text,
      labelIpa: JSON.stringify(data.label_ipa),
      errorIndexes: JSON.stringify(data.error_char_indexes),
      wordScores: JSON.stringify(data.word_scores),
      highlightedSentence,
      highlightedIPA,
      score: data.score
    });

    const improveBtn = document.createElement("button");
    improveBtn.textContent = "💡 Phân tích & gợi ý?";
    improveBtn.className = "btn btn-sm btn-outline-success mt-2";
    improveBtn.onclick = () => showImproveForm(resultDiv, inputText, topicId);
    resultDiv.appendChild(improveBtn);
  

    uploadBtn.textContent = "⬆️ Gửi lại";
  } catch (err) {
    alert("Gửi thất bại: " + err.message);
    resetUploadBtn(uploadBtn);
  } finally {
    uploadBtn.disabled = false;
  }
}

function resetUploadBtn(btn) {
  btn.textContent = "⬆️ Gửi";
  btn.disabled = false;
}

function uploadAudio(topicId) {
  uploadAudioCommon(topicId, "http://127.0.0.1:5000/part2");
}


function playAudio(url) {
  new Audio(url).play();
}

function showImproveForm(resultDiv, originalText, topicId) {
  const formId = `improve-form-${topicId}`;
  if (document.getElementById(formId)) return;

  const form = document.createElement("div");
  form.className = "mt-3 border rounded p-2 bg-white";
  form.id = formId;

  form.innerHTML = `
    <label for="edit-answer-${topicId}" class="form-label">✏️ Sửa câu trả lời:</label>
    <textarea id="edit-answer-${topicId}" class="form-control mb-2" rows="3">${resultDiv.dataset.originalAnswer || originalText}</textarea>
    <button class="btn btn-primary btn-sm" onclick="analyzeWithLLM('${topicId}')">Gửi phân tích</button>
    <div id="llm-analysis-${topicId}" class="mt-3"></div>
  `;

  resultDiv.appendChild(form);
}

async function analyzeWithLLM(topicId) {
  const answerText = document.getElementById(`edit-answer-${topicId}`).value;
  const questionText = document.getElementById(`text-question-${topicId}`)?.textContent || "";
  const analysisDiv = document.getElementById(`llm-analysis-${topicId}`);
  const analyzeBtn = document.querySelector(`#edit-answer-${topicId} ~ button`);

  const title = document.getElementById('topicTitle').value;
  const content = document.getElementById('topicContent').value;

  analyzeBtn.textContent = "⏳ Đang phân tích...";
  analyzeBtn.disabled = true;

  const prompt = `
  You are an IELTS speaking evaluator and English grammar expert. A student has answered an IELTS Speaking Part 2 topic.

    Your tasks are:
    1. Identify grammar and vocabulary mistakes in the student's answer.
    2. Explain the grammar or vocabulary corrections you made. If there are no mistakes, say "No grammar mistakes".
    3. Evaluate whether the answer is appropriate and relevant to the topic.
    4. Suggest a better version of the answer that would score Band higher (you can freely rephrase here).

    Return the result in this exact JSON format:
    {
      "grammar_explanation": "<detailed explanation of corrections or 'No grammar mistakes'>",
      "corrected_answer": "<the corrected version of the answer with same structure>",
      "relevance": "<evaluate how well the answer addresses the question>",
      "suggested_band_higher_answer": "<improved version for Band higher>"
    }

    Here is the input: Topic: "${title}", suggest content: "${content}"
    Student's answer: "${answerText}"
`;

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mistral", prompt, stream: false })
    });

    const text = await res.text();
    const analysis = JSON.parse(text);
    const resultDiv = document.getElementById(`${type}-result-${index}`);

    analysisDiv.innerHTML = `
      <div class="border rounded bg-light p-2">
        <div><strong>Sửa lỗi:</strong> ${analysis.grammar_explanation}</div>
        <div><strong>Liên quan:</strong> ${analysis.relevance}</div>
        <div><strong>Gợi ý:</strong> ${analysis.suggested_band_higher_answer}</div>
      </div>
    `;

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-success btn-sm mt-3";
    saveBtn.textContent = "Lưu";
    saveBtn.onclick = () => saveAnswer(type, index, analysis, resultDiv);
    analysisDiv.appendChild(saveBtn);
  } catch (err) {
    analysisDiv.innerHTML = `<div class="text-danger">Lỗi phân tích: ${err.message}</div>`;
  } finally {
    analyzeBtn.textContent = "Gửi phân tích";
    analyzeBtn.disabled = false;
  }
}

async function saveAnswer(topicId, analysis, resultDiv) {
  const topic = document.getElementById("topicId").value;
  const userId = document.getElementById("userId").value;
  const pronunciationData = {
    highlighted_sentence: resultDiv.dataset.highlightedSentence,
    highlighted_ipa: resultDiv.dataset.highlightedIPA,
    answerOriginal: resultDiv.dataset.originalAnswer,
    score: parseFloat(resultDiv.dataset.score)
  };

  const suggestData = analysis;
  const answerData = {
    topic,
    questionText: document.getElementById(`text-question-${index}`)?.textContent || "",
    answerText: document.getElementById(`edit-answer-${type}-${index}`).value,
    pronunciationData,
    suggestData
  };

  try {
    const res = await fetch(`/user/my-answer/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answerData)
    });
    const result = await res.json();
    alert(result.success ? "Đã lưu thành công!" : "Lưu thất bại!");
  } catch (err) {
    console.error(err);
    alert("Lỗi server khi lưu!");
  }
}
