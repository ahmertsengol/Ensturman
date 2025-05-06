import sounddevice as sd
import librosa
import numpy as np
import joblib

model = joblib.load("model/pitch_model.pkl")

def record_audio(duration=2, sr=16000):
    print("Kaydediliyor...")
    audio = sd.rec(int(duration * sr), samplerate=sr, channels=1)
    sd.wait()
    print("Kayıt tamamlandı.")
    return audio.flatten()

def predict_pitch(audio, sr=16000):
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfcc.T, axis=0).reshape(1, -1)
    pitch = model.predict(mfcc_mean)[0]
    return pitch
def pitch_to_note(pitch):
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octave = (pitch // 12) - 1
    note = notes[pitch % 12]
    return f"{note}{octave}"
    print(pitch_to_note(60))  # C4


audio = record_audio()
predicted_pitch = predict_pitch(audio)
print(f"Tahmin edilen nota pitch değeri: {predicted_pitch}")
