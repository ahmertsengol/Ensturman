import os
import json
import numpy as np
import librosa
import joblib

DATA_DIR = "data/nsynth-test"
AUDIO_DIR = os.path.join(DATA_DIR, "audio")
JSON_PATH = os.path.join(DATA_DIR, "examples.json")
OUTPUT_DIR = "extracted_features"

with open(JSON_PATH, "r") as f:
    metadata = json.load(f)

X = []
y = []

for filename, info in metadata.items():
    file_path = os.path.join(AUDIO_DIR, filename + ".wav")
    if not os.path.exists(file_path):
        continue
    try:
        audio, sr = librosa.load(file_path, sr=16000)
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfcc.T, axis=0)
        X.append(mfcc_mean)
        y.append(info["pitch"])
    except Exception as e:
        print(f"Hata: {e}")

# Verileri kaydet
joblib.dump((X, y), os.path.join(OUTPUT_DIR, "mfcc_dataset.pkl"))
print("MFCC verileri çıkarıldı ve kaydedildi.")
