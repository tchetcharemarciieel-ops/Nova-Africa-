#!/usr/bin/env python3
"""Voix off gratuite (Kokoro, voix française ff_siwis) : python3 tts.py episodes/jour01.json
Modèle à télécharger une fois dans monde/models/ (voir README). Génère out/<jour>.wav
et out/<jour>_dur.json : durées de scènes calées sur la voix, utilisées par render.py."""
import json, sys, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
M = os.path.join(os.path.dirname(__file__), "models")
k = Kokoro(f"{M}/kokoro.onnx", f"{M}/voices.bin")
ep = json.load(open(sys.argv[1])); day = os.path.splitext(os.path.basename(sys.argv[1]))[0]
os.makedirs("out", exist_ok=True)
parts, durs = [], []
for sc in ep["scenes"]:
    a, sr = k.create(sc["voice"], voice="ff_siwis", speed=1.05, lang="fr-fr")
    a = np.concatenate([np.zeros(int(.15 * sr)), a, np.zeros(int(.35 * sr))])
    parts.append(a); durs.append(round(len(a) / sr, 2))
sf.write(f"out/{day}.wav", np.concatenate(parts), sr)
json.dump(durs, open(f"out/{day}_dur.json", "w"))
print(durs, sum(durs))
