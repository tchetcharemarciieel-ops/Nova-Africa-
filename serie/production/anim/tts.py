"""Voix de synthèse françaises (espeak-ng via PyPI) avec timbres par personnage."""
import ctypes, numpy as np, re, hashlib, os
import espeakng_loader as _e

_lib = ctypes.CDLL(_e.get_library_path())
_buf = []
CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
def _cb(wav, n, ev):
    if wav and n > 0: _buf.append(np.ctypeslib.as_array(wav, shape=(n,)).copy())
    return 0
_cbref = CB(_cb)
_lib.espeak_Initialize.restype = ctypes.c_int
SR_TTS = _lib.espeak_Initialize(1, 0, _e.get_data_path().encode(), 0)
_lib.espeak_SetSynthCallback(_cbref)

# voix : (variante espeak, hauteur 0-99, débit mots/min, gamme)
VOICES = {
 'amara':    ('fr+f3', 62, 172, 70), 'nadege': ('fr+f2', 52, 160, 60), 'lea': ('fr+f4', 66, 180, 70),
 'fatou':    ('fr+f1', 78, 185, 80), 'kofi':   ('fr+m2', 28, 158, 40), 'ibrahim': ('fr+m3', 22, 150, 35),
 'karim':    ('fr+m1', 42, 170, 55), 'redac':  ('fr+m4', 38, 175, 50), 'courtier': ('fr+m7', 8, 140, 12),
 'narrateur':('fr+m5', 30, 150, 30),
}

def _raw(text, voice, rate_mul=1.0):
    name, pitch, rate, rng = VOICES[voice]
    _lib.espeak_SetVoiceByName(name.encode())
    _lib.espeak_SetParameter(1, int(min(300, rate * rate_mul)), 0); _lib.espeak_SetParameter(3, pitch, 0)
    _lib.espeak_SetParameter(4, rng, 0); _lib.espeak_SetParameter(2, 100, 0)
    _buf.clear()
    b = text.encode('utf-8'); _lib.espeak_Synth(b, len(b) + 1, 0, 0, 0, 1, None, None); _lib.espeak_Synchronize()
    return np.concatenate(_buf).astype(np.float32) / 32768 if _buf else np.zeros(100, np.float32)

def clean(text):
    t = re.sub(r'[🎙♥•]|\d+:\d+\s*—', '', text); t = t.replace('«', '').replace('»', '').replace('…', '...').replace('·', ',')
    t = t.replace('ép.', 'épisode').replace('USB', 'u-èss-bé').replace('NOVA', 'Nova')
    return re.sub(r'\s+', ' ', t).strip()

def _fx(x, voice, sr):
    n = lambda s: int(s * sr)
    if voice == 'courtier':           # voix grave déformée
        x = np.tanh(x * 2.2) * .7; r = np.sin(2 * np.pi * 55 * np.arange(len(x)) / sr); x = x * (.7 + .3 * r)
        for d, g in ((.05, .35), (.11, .2)): y = np.zeros(len(x) + n(d)); y[n(d):] += x * g; x = np.pad(x, (0, n(d))) + y[:len(x) + n(d)]
    if voice == 'narrateur':
        for d, g in ((.12, .25), (.26, .12)): y = np.zeros(len(x) + n(d)); y[n(d):] += x * g; x = np.pad(x, (0, n(d))) + y
    return x

_cache = {}
def say(text, voice, max_dur=None, sr_out=44100):
    """Retourne (samples float32 @44.1k). Accélère si dépasse max_dur."""
    t = clean(text); key = (t, voice, round(max_dur or 0, 1))
    if key in _cache: return _cache[key]
    mul = 1.0
    x = _raw(t, voice, mul)
    while max_dur and len(x) / SR_TTS > max_dur and mul < 1.55:
        mul += .12; x = _raw(t, voice, mul)
    x = _fx(x, voice, SR_TTS)
    n = int(len(x) * sr_out / SR_TTS); y = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
    # filtre grave/aigu léger + normalisation
    y = y - np.convolve(y, np.ones(400) / 400, 'same') * .35; y = y / max(1e-6, np.abs(y).max()) * .9
    _cache[key] = y; return y
