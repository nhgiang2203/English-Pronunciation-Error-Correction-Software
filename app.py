from flask import Flask, request, jsonify
import os
import torch
import whisper
import torchaudio
import numpy as np
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
from phonemizer import phonemize
import re
from gtts import gTTS
from flask_cors import CORS
import cloudinary
from cloudinary import uploader
from dotenv import load_dotenv
load_dotenv()
cloudinary.config(
    cloud_name = os.getenv("CLOUD_NAME"),
    api_key = os.getenv("CLOUD_KEY"),
    api_secret = os.getenv("CLOUD_SECRET"),
    secure = True
)

print("Cloudinary config:", os.getenv("CLOUD_NAME"), os.getenv("CLOUD_KEY"), os.getenv("CLOUD_SECRET"))


app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
UPLOAD_AUDIO_DATA = "audioData"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_AUDIO_DATA, exist_ok=True)
model_path = "./wav2vec2"

# Load models
whisper_model = whisper.load_model("medium")
ctc_model = Wav2Vec2ForCTC.from_pretrained(model_path)
processor = Wav2Vec2Processor.from_pretrained(model_path)

def convert_audio(file_path):
    wav_path = file_path.replace(".webm", ".wav")
    os.system(f"ffmpeg -y -i {file_path} -ac 1 -ar 16000 -sample_fmt s16 {wav_path}")
    return wav_path

def load_waveform(wav_path):
    waveform, sample_rate = torchaudio.load(wav_path)
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0)
    return waveform.unsqueeze(0) if waveform.dim() == 1 else waveform, sample_rate

def transcribe_ipa(waveform, sample_rate):
    input_values = processor(waveform, sampling_rate=sample_rate, return_tensors="pt").input_values
    input_values = input_values.squeeze(1) if input_values.dim() == 3 else input_values
    logits = ctc_model(input_values).logits
    predicted_ids = logits.argmax(dim=-1)
    return processor.batch_decode(predicted_ids)[0]

def eng2ipa(text):
    words = text.strip().split()
    print(words)

    ipa_words = phonemize(
        words,
        language='en-us',
        backend='espeak',
        strip=True,
        preserve_punctuation=True,
        with_stress=False,       # không tạo trọng âm
    )

    # Xoá dấu trọng âm còn sót lại nếu có
    ipa_words = [re.sub(r"[ˈˌ]", "", ipa.strip()) for ipa in ipa_words]
    ipa_text = ' '.join(ipa_words)
    ipa_text = ipa_text.replace('.', '').replace(',', '')
    return ipa_text 


def calculate_score(correct_count, total_count):
    return np.round(correct_count / (total_count + 0.001), 2)

def find_lcs(label, pred):
    m, n = len(label), len(pred)
    L = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            L[i][j] = L[i - 1][j - 1] + 1 if label[i - 1] == pred[j - 1] else max(L[i - 1][j], L[i][j - 1])
    lcs_indexes = []
    matched_in_label = [False] * m
    matched_to_label = [-1] * n
    i, j = m, n
    while i > 0 and j > 0:
        if label[i - 1] == pred[j - 1]:
            lcs_indexes.append(i - 1)
            matched_in_label[i - 1] = True
            matched_to_label[j - 1] = i - 1
            i -= 1
            j -= 1
        elif L[i - 1][j] > L[i][j - 1]:
            i -= 1
        else:
            j -= 1
    lcs_indexes.reverse()
    return lcs_indexes, matched_in_label, matched_to_label

def get_score(label, pred):
    lcs_indexes, matched_in_label, matched_to_label = find_lcs(label, pred)
    lcs_string = ''.join(label[i] for i in lcs_indexes)
    print(lcs_string)
    print(len(label))
    print(len(pred))
    correct = len(lcs_indexes)
    print(correct)
    precision = correct / (len(pred) + 1e-6)
    print(precision)
    recall = correct / (len(label) + 1e-6)
    print(recall)
    f1 = np.round(2 * precision * recall / (precision + recall + 1e-6), 2)

    error_indexes = np.ones(len(label), dtype=bool)
    for index in lcs_indexes:
        error_indexes[index] = False

    return f1, error_indexes, matched_in_label, matched_to_label

def word_level_scores(label_string, error_indexes):
    words = label_string.split()
    word_scores = []
    error_char_indexes = []

    char_ptr = 0
    for word in words:
        print(word)
        word_len = len(word)
        correct = 0
        matched = 0
        word_error_indexes = []

        for i in range(word_len):
            if char_ptr >= len(error_indexes):
                word_error_indexes.append(True)
                matched += 1
                char_ptr += 1
                continue

            if not error_indexes[char_ptr]:  # ký tự đúng
                correct += 1
            word_error_indexes.append(bool(error_indexes[char_ptr]))
            matched += 1
            char_ptr += 1

        precision = correct / (matched + 1e-6)
        recall = correct / (word_len + 1e-6)
        f1 = 2 * precision * recall / (precision + recall + 1e-6)
        word_scores.append(round(f1, 2))

        error_char_indexes.extend(word_error_indexes)
        error_char_indexes.append(None)  # dấu cách

    if error_char_indexes:
        error_char_indexes = error_char_indexes[:-1]  # bỏ dấu cách cuối
    
    print(word_scores)
    print(error_char_indexes)

    return word_scores, error_char_indexes


@app.route("/part1", methods=["POST"])
def process_part1():
    file = request.files.get("audio")
    text = request.form.get("text")
    if not file or not text:
        return jsonify({"error": "Missing audio or text input"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    wav_path = convert_audio(filepath)
    waveform, sample_rate = load_waveform(wav_path)
    predicted_ipa = transcribe_ipa(waveform, sample_rate)

    label_string = eng2ipa(text)
    label = label_string.replace(' ', '')
    pred = predicted_ipa.replace(' ', '')
    score, error_indexes, *_ = get_score(label, pred)
    word_scores, error_char_indexes = word_level_scores(label_string, error_indexes)

    return jsonify({
        "text": text,
        "label_ipa": label_string,
        "predicted_ipa": predicted_ipa,
        "score": score,
        "word_scores": word_scores,
        "error_char_indexes": error_char_indexes
    })

@app.route("/part2", methods=["POST"])
def process_part2():
    file = request.files.get("audio")
    if not file:
        return jsonify({"error": "No file uploaded, please attach an audio file."}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    wav_path = convert_audio(filepath)
    waveform, sample_rate = load_waveform(wav_path)
    ipa_pred = transcribe_ipa(waveform, sample_rate)
    text = whisper_model.transcribe(wav_path, language="en")["text"].strip()

    label_string = eng2ipa(text)
    label = label_string.replace(' ', '')
    pred = ipa_pred.replace(' ', '')
    score, error_indexes, *_ = get_score(label, pred)
    word_scores, error_char_indexes = word_level_scores(label_string, error_indexes)

    return jsonify({
        "text": text,
        "label_ipa": label_string,
        "predicted_ipa": ipa_pred,
        "score": score,
        "word_scores": word_scores,
        "error_char_indexes": error_char_indexes
    })

@app.route('/tts', methods=['POST'])  # sửa lại `methods=['POST']` thay vì `method`
def tts():
    text = request.form.get('text')
    typeText = request.form.get('type')
    index = request.form.get('index')
    topic = request.form.get('topic')
    print(text)

    if not text:
        return jsonify({"error": "Missing text input"}), 400

    filename = f'{topic}-{typeText}-{index}.mp3'
    filepath = os.path.join(UPLOAD_AUDIO_DATA, filename)

    try:
        # 1. Tạo file audio
        tts = gTTS(text=text, lang='en')
        tts.save(filepath)
        print(filepath)

        # 2. Upload lên Cloudinary
        upload_result = uploader.upload(
            filepath,
            resource_type="video",  # Cloudinary yêu cầu audio/mp3 là resource_type=video
            public_id=filename.replace('.mp3', ''),
            overwrite=True
        )
        print(filepath)
        # 3. Xoá file tạm nếu muốn
        os.remove(filepath)
        print(upload_result["secure_url"])

        # 4. Trả về URL Cloudinary
        return jsonify({
            "success": True,
            "file": filename,
            "url": upload_result["secure_url"]
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    

if __name__ == "__main__":
    app.run(debug=True)
