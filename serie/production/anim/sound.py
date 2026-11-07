"""Synthèse sonore (numpy) : nappe sombre, arpèges, battements, impacts, pas, whoosh, vibreur."""
import numpy as np, wave
SR = 44100
rng = np.random.default_rng(11)

def lp(x, n): return np.convolve(x, np.ones(n) / n, 'same')
def env(n, a=.005, d=3.0): 
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t * d)
def add(buf, t0, x, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i < 0: return
    j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i] * g

def boom(d=2.2):
    n = int(d * SR); t = np.arange(n) / SR
    f = 28 + 95 * np.exp(-t * 4); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 1.8) * 1.0 + lp(rng.normal(0, 1, n), 40) * np.exp(-t * 6) * 1.4)
def whoosh(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR; x = rng.normal(0, 1, n)
    x = lp(x, 6) - lp(x, 200); return x * np.sin(np.pi * t / d) ** 2 * 1.6
def splash(d=1.4):
    n = int(d * SR); x = rng.normal(0, 1, n); x = x - lp(x, 20); return x * env(n, .002, 3.2) * 1.2 + lp(rng.normal(0, 1, n), 120) * env(n, .01, 2.5)
def buzz():
    n = int(.14 * SR); t = np.arange(n) / SR; return np.sign(np.sin(2 * np.pi * 170 * t)) * .22 * np.minimum(1, (.14 - t) * 40)
def step(g=1.0):
    n = int(.12 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 85 * t) * np.exp(-t * 38) + lp(rng.normal(0, 1, n), 10) * np.exp(-t * 60) * .6) * g
def ding():
    n = int(1.2 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 880 * t) + .5 * np.sin(2 * np.pi * 1320 * t)) * np.exp(-t * 3.5) * .5
def riser(d=2.5):
    n = int(d * SR); t = np.arange(n) / SR; f = 120 * np.exp(t / d * 2.3)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .6 + (lp(rng.normal(0, 1, n), 4) - lp(rng.normal(0, 1, n), 80)) * .4) * (t / d) ** 2
def heart(g=1.0):
    out = np.zeros(int(.6 * SR))
    for o, a in ((0, 1), (.2, .7)):
        n = int(.18 * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * 52 * t) * np.exp(-t * 22) * a; i = int(o * SR); out[i:i + n] += x
    return out * g
def pluck(f, g=1.0, d=1.4):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .15 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 5.5) * g
def type_tick(): n = int(.03 * SR); return rng.normal(0, 1, n) * np.exp(-np.arange(n) / SR * 150) * .15

MOOD = {'calm': (.0, 52, .5), 'tense': (.05, 62, 1.0), 'chase': (.12, 92, 1.5), 'dark': (.0, 48, .6), 'end': (.06, 70, 1.2)}
NOTES = [110, 130.8, 164.8, 196, 220, 261.6, 329.6, 392]

def build(path, total, events, moods):
    n = int((total + 1.5) * SR); buf = np.zeros(n); t = np.arange(n) / SR
    # nappe
    pad = (np.sin(2 * np.pi * 55 * t) * .5 + np.sin(2 * np.pi * 82.4 * t + np.sin(t * .3)) * .35 + np.sin(2 * np.pi * 110.4 * t) * .2) * (.6 + .4 * np.sin(t * .4))
    buf += pad * .22 + lp(rng.normal(0, 1, n), 120) * .09
    for (a, b, m) in moods:
        arp, bpm, hv = MOOD.get(m, MOOD['calm'])
        beat = 60 / bpm
        tt = a
        while tt < b - .1:
            add(buf, tt, heart(), .5 * hv * (.5 if m == 'calm' else 1)); tt += beat * 1.0
        if arp:
            step_ = 60 / (bpm * 1.6) / 2; k = 0; tt = a
            pat = [0, 2, 4, 2, 5, 4, 2, 3]
            while tt < b - .1:
                add(buf, tt, pluck(NOTES[pat[k % 8]] * (2 if k % 3 == 0 else 1), arp * (.6 + .4 * (k % 2))), 1); k += 1; tt += step_
    for (t0, kind, args) in events:
        if kind == 'boom': add(buf, t0, boom(), .95)
        elif kind == 'whoosh': add(buf, t0, whoosh(), .55)
        elif kind == 'splash': add(buf, t0, splash(), .6)
        elif kind == 'buzz':
            for i in range(3): add(buf, t0 + i * .28, buzz(), 1)
        elif kind == 'step': add(buf, t0, step(.3 * (args[0] if args else 1)), 1)
        elif kind == 'ding': add(buf, t0, ding(), .5)
        elif kind == 'riser': add(buf, t0, riser(args[0] if args else 2.5), .55)
        elif kind == 'type':
            for i in range(int((args[0] if args else 1.5) * 12)): add(buf, t0 + i * .08 + np.random.rand() * .03, type_tick(), 1)
        elif kind == 'shot': add(buf, t0, boom(1.2), 1.0); add(buf, t0, lp(rng.normal(0, 1, int(.4 * SR)), 3) * env(int(.4 * SR), .001, 12), .8)
        elif kind == 'glass': add(buf, t0, (rng.normal(0, 1, int(.9 * SR)) - lp(rng.normal(0, 1, int(.9 * SR)), 8)) * env(int(.9 * SR), .001, 5), .5)
    # écho
    for dly, g in ((.28, .32), (.57, .16)):
        d = int(dly * SR); buf[d:] += buf[:-d] * g * .6
    buf = np.tanh(buf * .9)
    f = int(1.2 * SR); buf[:f] *= np.linspace(0, 1, f); buf[-f * 2:] *= np.linspace(1, 0, f * 2)
    buf = buf / max(1e-6, np.abs(buf).max()) * .88
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype(np.int16).tobytes())
