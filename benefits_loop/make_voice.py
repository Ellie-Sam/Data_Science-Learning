# Generates one narration clip per scene with Kokoro (open-source local TTS).
# Usage: python make_voice.py <model_dir> <out_dir> <voice> <speed>
import sys, json, os, soundfile as sf
from kokoro_onnx import Kokoro
model, out, voice, speed = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
here = os.path.dirname(os.path.abspath(__file__))
lines = json.load(open(os.path.join(here, 'voice_lines.json')))
k = Kokoro(os.path.join(model, 'kokoro.onnx'), os.path.join(model, 'voices.bin'))
os.makedirs(out, exist_ok=True)
lens = []
for i, t in enumerate(lines):
    a, sr = k.create(t, voice=voice, speed=speed, lang='en-us')
    sf.write(os.path.join(out, f'line{i:02d}.wav'), a, sr); lens.append(round(len(a) / sr, 3))
json.dump(lens, open(os.path.join(out, 'lens.json'), 'w')); print(voice, speed, lens, round(sum(lens), 2))
