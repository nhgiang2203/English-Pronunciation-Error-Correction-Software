let currentRecorder = null;
let currentChunks = [];
let currentStream = null;
let currentAudio = null;

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

      currentRecorder.ondataavailable = e => {
        if (e.data.size > 0) currentChunks.push(e.data);
      };

      currentRecorder.onstop = () => {
        const blob = new Blob(currentChunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(blob);
        document.getElementById(`${type}-audio-${index}`).src = audioURL;
        audioBlobs[`${type}-${index}`] = blob;

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

function stopRecording(type, index) {
  if (currentRecorder?.state === "recording") currentRecorder.stop();
  document.getElementById(`start-btn-${type}-${index}`).disabled = false;
  document.getElementById(`stop-btn-${type}-${index}`).disabled = true;
}

function cleanupStream() {
  currentStream?.getTracks().forEach(track => track.stop());
  currentRecorder = null;
  currentStream = null;
}

function createFormData(blob, text, type, index) {
  const formData = new FormData();
  formData.append("audio", blob, `${type}-${index}.webm`);
  formData.append("text", text);
  return formData;
}

function highlightIPA(labelIPA, errorIndexes) {
  let result = '', errorIdx = 0;
  for (const ch of labelIPA) {
    const flag = errorIndexes[errorIdx];
    
    if (flag === null) {
      result += ' ';
      errorIdx++;
    } else {
      const isError = flag === true;
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

async function uploadAudioCommon(type, index, url, isPractice = false) {
  const uploadBtn = document.getElementById(`upload-btn-${type}-${index}`);
  const resultDiv = document.getElementById(`${type}-result-${index}`);
  const textElem = document.getElementById(`text-${type}-${index}`);
  console.log(textElem?.textContent); 
  const inputText = textElem?.textContent.trim();
  console.log(inputText);
  const blob = audioBlobs[`${type}-${index}`];

  uploadBtn.textContent = "⬆️ Đang gửi...";
  uploadBtn.disabled = true;

  if (!blob || !inputText) {
    alert("Thiếu audio hoặc text gốc!");
    resetUploadBtn(uploadBtn);
    return;
  }

  try {
    const res = await fetch(url, { method: "POST", body: createFormData(blob, inputText, type, index) });
    const data = await res.json();

    const highlightedIPA = highlightIPA(data.label_ipa, data.error_char_indexes);
    const highlightedSentence = highlightSentence(data.text.split(" "), data.word_scores);
    const badge = data.score >= 0.8 ? 'success' : data.score >= 0.5 ? 'warning' : 'danger';

    resultDiv.innerHTML = `
      <div class="mt-2 border rounded p-2 bg-light">
        <div><strong>Câu gốc:</strong> ${highlightedSentence}</div>
        <div><strong>IPA:</strong> ${highlightedIPA}</div>
        <div><strong>Điểm tổng:</strong> <span class="badge bg-${badge}">${(data.score*10).toFixed(1)}</span></div>
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

    if (isPractice) {
      const saveBtn = document.createElement("button");
      saveBtn.className = "btn btn-success btn-sm mt-3 me-2";
      saveBtn.textContent = "Lưu";
      saveBtn.onclick = () => saveAnswer(type, index, {}, resultDiv);
      resultDiv.appendChild(saveBtn);

      const improveBtn = document.createElement("button");
      improveBtn.textContent = "💡 Phân tích & gợi ý?";
      improveBtn.className = "btn btn-sm btn-outline-success mt-2 me-2";
      improveBtn.onclick = () => showImproveForm(resultDiv, inputText, document.getElementById(`question-${type}-${index}`)?.textContent || "", type, index);
      resultDiv.appendChild(improveBtn);
    } else {
      const saveBtn = document.createElement("button");
      saveBtn.className = "btn btn-success btn-sm mt-3";
      saveBtn.textContent = "Lưu";
      console.log(type, index);
      saveBtn.onclick = () => saveSample(type, index, resultDiv);
      resultDiv.appendChild(saveBtn);
    }

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

function uploadAudio(type, index) {
  uploadAudioCommon(type, index, "http://127.0.0.1:5000/part1", false);
}

function uploadAudioPrac(type, index) {
  uploadAudioCommon(type, index, "http://127.0.0.1:5000/part2", true);
}



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


function showImproveForm(resultDiv, originalText, questionText, type, index) {
  const formId = `improve-form-${type}-${index}`;
  if (document.getElementById(formId)) return;

  const form = document.createElement("div");
  form.className = "mt-3 border rounded p-2 bg-white";
  form.id = formId;

  form.innerHTML = `
    <label for="edit-answer-${type}-${index}" class="form-label">✏️ Sửa câu trả lời:</label>
    <textarea id="edit-answer-${type}-${index}" class="form-control mb-2" rows="3">${resultDiv.dataset.originalAnswer || originalText}</textarea>
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

  analyzeBtn.textContent = "⏳ Đang phân tích...";
  analyzeBtn.disabled = true;

  const prompt = `
  You are an IELTS speaking evaluator and English grammar expert. A student has answered an IELTS Speaking Part 1 question.

  Your tasks are:
  1. Identify grammar and vocabulary mistakes in the student's answer.
  2. Explain the grammar or vocabulary corrections you made. If there are no mistakes, say "No grammar mistakes".
  3. Evaluate whether the answer is appropriate and relevant to the question.
  4. Suggest a better version of the answer that would score Band higher (you can freely rephrase here).

  Return the result in this exact JSON format:
  {
    "grammar_explanation": "<detailed explanation of corrections or 'No grammar mistakes'>",
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
      body: JSON.stringify({model: 'mistral', prompt, stream: false })
    });

    const text = await res.text();
    console.log("LLM raw response:", text);
     // Parse lần đầu
    const outer = JSON.parse(text);

    // Parse lần hai với field "response"
    const analysis = JSON.parse(outer.response);
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

async function saveAnswer(type, index, analysis={}, resultDiv) {
  const topic = document.getElementById("topicId").value;
  const userId = document.getElementById("userId").value;
  const pronunciationData = {
    highlighted_sentence: resultDiv.dataset.highlightedSentence,
    highlighted_ipa: resultDiv.dataset.highlightedIPA,
    answerOriginal: resultDiv.dataset.originalAnswer,
    score: parseFloat(resultDiv.dataset.score)
  };

  const suggestData = analysis;
  const answerTextarea = document.getElementById(`edit-answer-${type}-${index}`);
  const answerText = answerTextarea ? answerTextarea.value : document.getElementById(`text-answer-${index}`)?.textContent;

  const answerData = {
    topic,
    questionText: document.getElementById(`text-question-${index}`)?.textContent || "",
    answerText,
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

async function saveSample(type, index, resultDiv) {
  const topic = document.getElementById("topicId").value;
  const userIdElem = document.getElementById("userId");
  let userId = '';
  console.log(userIdElem);
  if (userIdElem == null || userIdElem === "") {
    window.location.href = "/user/login";
    return;
  } else {
    userId = userIdElem.value;
  }
  const pronunciationData = {
    highlighted_sentence: resultDiv.dataset.highlightedSentence,
    highlighted_ipa: resultDiv.dataset.highlightedIPA,
    answerOriginal: resultDiv.dataset.originalAnswer,
    score: parseFloat(resultDiv.dataset.score)
  };

  const text = `${type}Text`;
  const answerData = {
    topic,
    [ text ]: document.getElementById(`text-${type}-${index}`)?.textContent || "",
    pronunciationData
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


document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab === 'practices') {
    const trigger = document.querySelector('#tab-practices');
    if (trigger) new bootstrap.Tab(trigger).show();
  } else {
    const trigger = document.querySelector('#tab-samples');
    if (trigger) new bootstrap.Tab(trigger).show();
  }
});


document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll("[button-pagination]");

  buttons.forEach(btn => {
    btn.addEventListener("click", function () {
      const page = this.getAttribute("button-pagination");

      const url = new URL(window.location.href);
      const tab = document.querySelector(".nav-link.active")?.getAttribute("href").replace("#", "");

      // Sử dụng page query riêng theo tab
      if (tab === "samples") {
        url.searchParams.set("samplePage", page);
        url.searchParams.set("tab", "samples");
      } else if (tab === "practices") {
        url.searchParams.set("practicePage", page);
        url.searchParams.set("tab", "practices");
      }

      window.location.href = url.toString();
    });
  });

  // Kích hoạt tab khi load lại trang
  const params = new URLSearchParams(window.location.search);
  const activeTab = params.get("tab");
  if (activeTab) {
    document.querySelector(`a[href="#${activeTab}"]`)?.click();
  }
});
