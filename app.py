from flask import Flask, request, jsonify
import os
import torch
import whisper
import torchaudio
import numpy as np
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import eng_to_ipa as ei
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
model_path = "./wav2vec2"

# Load models once
whisper_model = whisper.load_model("medium")
ctc_model = Wav2Vec2ForCTC.from_pretrained(model_path)
processor = Wav2Vec2Processor.from_pretrained(model_path)

@app.route("/part1", methods=["POST"])
def process_part1():
    file = request.files.get("audio")
    text = request.form.get("text")  # Nhận văn bản gốc từ frontend

    if not file or not text:
        return jsonify({"error": "Missing audio or text input"}), 400

    filename = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filename)

    # Convert audio
    wav_path = filename.replace(".webm", ".wav")
    os.system(f"ffmpeg -y -i {filename} -ac 1 -ar 16000 -sample_fmt s16 {wav_path}")

    # Load and preprocess audio
    waveform, sample_rate = torchaudio.load(wav_path)
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0)
    waveform = waveform.unsqueeze(0) if waveform.dim() == 1 else waveform

    # Predict IPA using Wav2Vec2
    input_values = processor(waveform, sampling_rate=sample_rate, return_tensors="pt").input_values
    input_values = input_values.squeeze(1) if input_values.dim() == 3 else input_values
    logits = ctc_model(input_values).logits
    predicted_ids = logits.argmax(dim=-1)
    predicted_ipa = processor.batch_decode(predicted_ids)[0]

    # Convert reference text to IPA
    def eng2ipa(text):
        ipa_text = ei.convert(text)
        for ch in ['*', 'ˈ', 'ˌ']:
            ipa_text = ipa_text.replace(ch, '')
        return ipa_text

    label_string = eng2ipa(text)
    label = label_string.replace(' ', '')
    pred = predicted_ipa.replace(' ', '')

    # === LCS Scoring ===
    def calculate_score(correct_count, total_count):
        return np.round(correct_count / (total_count + 0.001), 2)

    def find_lcs(label, pred):
        m, n = len(label), len(pred)
        L = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if label[i - 1] == pred[j - 1]:
                    L[i][j] = L[i - 1][j - 1] + 1
                else:
                    L[i][j] = max(L[i - 1][j], L[i][j - 1])
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
        score = calculate_score(len(lcs_indexes), len(label))
        error_indexes = np.ones(len(label), dtype=bool)
        for index in lcs_indexes:
            error_indexes[index] = False
        return score, error_indexes, matched_in_label, matched_to_label

    score, error_indexes, matched_in_label, matched_to_label = get_score(label, pred)

    # Gán mỗi ký tự IPA vào từ trong văn bản
    label_words = label_string.split(' ')
    label_chars = []
    label_word_ids = []
    for idx, word in enumerate(label_words):
        for ch in word:
            label_chars.append(ch)
            label_word_ids.append(idx)

    # Tính điểm từng từ
    word_scores = []
    char_index = 0
    correct_char_count = 0
    char_in_word_count = 0
    error_char_indexes = []

    for i, char in enumerate(label_string):
        if char == ' ':
            word_scores.append(calculate_score(correct_char_count, char_in_word_count))
            correct_char_count = 0
            char_in_word_count = 0
            continue

        if char_index >= len(error_indexes) or error_indexes[char_index]:
            error_char_indexes.append(False)
        else:
            correct_char_count += 1
            error_char_indexes.append(True)

        char_index += 1
        char_in_word_count += 1

    if char_in_word_count > 0:
        word_scores.append(calculate_score(correct_char_count, char_in_word_count))

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
    print(f"File received: {file.filename}")
    if not file:
        return jsonify({"error": "No file uploaded, please attach an audio file."}), 400

    filename = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filename)

    # Convert audio to wav if needed
    wav_path = filename.replace(".webm", ".wav")
    os.system(f"ffmpeg -y -i {filename} -ac 1 -ar 16000 -sample_fmt s16 {wav_path}")

    # Load audio
    waveform, sample_rate = torchaudio.load(wav_path)
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0)
    waveform = waveform.unsqueeze(0) if waveform.dim() == 1 else waveform

    # IPA transcription
    input_values = processor(waveform, sampling_rate=sample_rate, return_tensors="pt").input_values
    input_values = input_values.squeeze(1) if input_values.dim() == 3 else input_values

    logits = ctc_model(input_values).logits
    predicted_ids = logits.argmax(dim=-1)
    ipa_pred = processor.batch_decode(predicted_ids)[0]

    # Whisper transcription
    whisper_result = whisper_model.transcribe(wav_path, language="en")
    text = whisper_result["text"].strip()

    # Convert reference text to IPA
    def eng2ipa(text):
        ipa_text = ei.convert(text)
        for ch in ['*', 'ˈ', 'ˌ']:
            ipa_text = ipa_text.replace(ch, '')
        return ipa_text

    label_string = eng2ipa(text)
    label = label_string.replace(' ', '')
    pred = ipa_pred.replace(' ', '')

    # === LCS Scoring ===
    def calculate_score(correct_count, total_count):
        return np.round(correct_count / (total_count + 0.001), 2)

    def find_lcs(label, pred):
        m, n = len(label), len(pred)
        L = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if label[i - 1] == pred[j - 1]:
                    L[i][j] = L[i - 1][j - 1] + 1
                else:
                    L[i][j] = max(L[i - 1][j], L[i][j - 1])
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
        score = calculate_score(len(lcs_indexes), len(label))
        error_indexes = np.ones(len(label), dtype=bool)
        for index in lcs_indexes:
            error_indexes[index] = False
        return score, error_indexes, matched_in_label, matched_to_label

    score, error_indexes, matched_in_label, matched_to_label = get_score(label, pred)

    # Gán mỗi ký tự IPA vào từ trong văn bản
    label_words = label_string.split(' ')
    label_chars = []
    label_word_ids = []
    for idx, word in enumerate(label_words):
        for ch in word:
            label_chars.append(ch)
            label_word_ids.append(idx)

    # Tính điểm từng từ
    word_scores = []
    char_index = 0
    correct_char_count = 0
    char_in_word_count = 0
    error_char_indexes = []

    for i, char in enumerate(label_string):
        if char == ' ':
            word_scores.append(calculate_score(correct_char_count, char_in_word_count))
            correct_char_count = 0
            char_in_word_count = 0
            continue

        if char_index >= len(error_indexes) or error_indexes[char_index]:
            error_char_indexes.append(False)
        else:
            correct_char_count += 1
            error_char_indexes.append(True)

        char_index += 1
        char_in_word_count += 1

    if char_in_word_count > 0:
        word_scores.append(calculate_score(correct_char_count, char_in_word_count))

    return jsonify({
        "text": text,
        "label_ipa": label_string,
        "predicted_ipa": ipa_pred,
        "score": score,
        "word_scores": word_scores,
        "error_char_indexes": error_char_indexes
    })

if __name__ == "__main__":
    app.run(debug=True)
