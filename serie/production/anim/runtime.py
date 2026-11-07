"""Moteur de scènes : acteurs animés, sous-titres, overlays, caméra, export ffmpeg."""
import cairo, math, subprocess, os, random, numpy as np
from gfx import *
import bgs, sound, tts

FPS = 30
VOICES = False
FONT = 'DejaVu Sans'

def interp(kf, t, n=2):
    """kf: [(t, v1, v2..)] -> valeurs interpolées (linéaire, tenues aux bornes)."""
    if t <= kf[0][0]: return list(kf[0][1:])
    for a, b in zip(kf, kf[1:]):
        if t <= b[0]:
            k = (t - a[0]) / max(1e-6, b[0] - a[0])
            return [a[i] + (b[i] - a[i]) * k for i in range(1, len(a))]
    return list(kf[-1][1:])

class Actor:
    def __init__(self, sc, d, dur):
        self.ch = d['ch']; self.d = d; self.scale = d.get('scale', 1.0); self.yb = d.get('y', 0); self.vis = d.get('vis')
        kf = [tuple(list(k) + [0] * (4 - len(k))) for k in d['kf']]     # (t,x,yoff,rot)
        n = int(dur * FPS) + 2
        self.x = np.zeros(n); self.yo = np.zeros(n); self.rot = np.zeros(n); self.sp = np.zeros(n)
        self.ph = np.zeros(n); self.face = np.ones(n)
        self.st = {}
        for i in range(n):
            v = interp(kf, i / FPS); self.x[i], self.yo[i], self.rot[i] = v[0], v[1], v[2]
        w = int(.3 * FPS) | 1; win = np.hanning(w + 2)[1:-1]; win /= win.sum()
        self.x = np.convolve(np.pad(self.x, w, mode='edge'), win, 'same')[w:-w]
        cur_face = d.get('face', 1); dist = 0.0; prev = None
        faces = d.get('faces')
        for i in range(n):
            t = i / FPS
            if prev is not None:
                dx = self.x[i] - prev; sp = abs(dx) * FPS; self.sp[i] = sp
                if sp > 8 and 'face' not in d: cur_face = 1 if dx > 0 else -1
                st = (216 if sp > 150 else 132) * self.scale * CHARS[self.ch]['s']
                dist += abs(dx) / st * 6.2832
            self.ph[i] = dist
            if faces: cur_face = interp([(a, b) for a, b in faces], t)[0]
            self.face[i] = cur_face; prev = self.x[i]
        self.sp = np.convolve(self.sp, np.ones(5) / 5, 'same')
        self.poses = d.get('poses', [(0, 'idle')])
    def pose_at(self, t, sp):
        p = 'idle'
        for tt, name in self.poses:
            if t >= tt: p = name
        if sp > 8 and p in ('idle', 'talk', 'sad', 'cross'): return 'walk'
        return p
    def draw(self, c, i, t, amb):
        i = min(i, len(self.x) - 1)
        if self.vis and not (self.vis[0] <= t <= self.vis[1]): return
        pose = self.pose_at(t, self.sp[i])
        draw_char(c, self.ch, self.x[i], GROUND + self.yb + self.yo[i], face=self.face[i], t=t + self.d.get('seed', 0),
                  pose=pose, phase=self.ph[i], speed=self.sp[i], rot=self.rot[i], scale=self.scale, amb=amb, st=self.st, dt=1 / FPS)

def text_lines(c, text, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if c.text_extents(t).x_advance <= maxw: cur = t
        else: lines.append(cur); cur = w
    return lines + [cur]

def outlined(c, txt, x, y, col=(1, 1, 1), lw=9):
    c.move_to(x, y); c.text_path(txt); c.set_source_rgb(0, 0, 0); c.set_line_width(lw); c.set_line_join(cairo.LINE_JOIN_ROUND); c.stroke_preserve()
    c.set_source_rgb(*col); c.fill()

def centered(c, txt, cx, y, size, col=(1, 1, 1), bold=True, lw=0, serif=False, a=1.0):
    c.select_font_face('DejaVu Serif' if serif else FONT, 0, 1 if bold else 0); c.set_font_size(size)
    x = cx - c.text_extents(txt).x_advance / 2
    if lw: outlined(c, txt, x, y, col, lw)
    else: c.move_to(x, y); c.set_source_rgba(*col, a); c.show_text(txt)

AMBER = hx('#e8a23a'); RED = hx('#e5383b')

def draw_caption(c, who, text, k):
    c.select_font_face(FONT, 0, 1); c.set_font_size(42)
    lines = text_lines(c, text, 560)
    pop = 0.9 + 0.1 * min(1, k / 0.12); y0 = 1040 - 54 * (len(lines) - 1)
    c.save(); c.translate(W / 2 - 10, y0 - 20); c.scale(pop, pop); c.translate(-W / 2 + 10, -(y0 - 20))
    if who: centered(c, who.upper(), W / 2 - 10, y0 - 62, 27, AMBER, lw=7)
    for i, l in enumerate(lines): centered(c, l, W / 2 - 10, y0 + i * 54, 42, lw=10)
    c.restore()

def draw_phone(c, o, t):
    rect(c, 0, 0, W, H, (0, 0, 0), .62)
    x, y, w, h = 150, 150, 420, 800
    rrect(c, x - 10, y - 10, w + 20, h + 20, 56); c.set_source_rgb(.12, .12, .15); c.fill()
    rrect(c, x, y, w, h, 46); c.set_source_rgb(.055, .065, .08); c.fill()
    red = o.get('red'); col = RED if red else hx('#4db6e5')
    rect(c, x, y, w, 96, hx('#14171d')); c.set_source_rgb(*col); c.arc(x + 48, y + 52, 22, 0, 6.3); c.fill()
    centered(c, (o.get('who') or '?')[:1], x + 48, y + 62, 24, (0, 0, 0))
    c.select_font_face(FONT, 0, 1); c.set_font_size(26); c.move_to(x + 84, y + 60); c.set_source_rgb(1, 1, 1); c.show_text(o['who'])
    yy = y + 130
    for dt, text, side in o['msgs']:
        if t < dt: break
        k = min(1, (t - dt) / .25); c.select_font_face(FONT, 0, 0); c.set_font_size(27)
        lines = text_lines(c, text, 300); bh = 26 + 36 * len(lines); bw = max(c.text_extents(l).x_advance for l in lines) + 36
        bx = x + 22 if side == 'l' else x + w - 22 - bw
        c.save(); c.translate(0, (1 - k) * 18)
        rrect(c, bx, yy, bw, bh, 22); c.set_source_rgba(*((.17, .19, .24) if side == 'l' else ((.55, .1, .12) if red else (.1, .45, .6))), k); c.fill()
        for i, l in enumerate(lines): c.move_to(bx + 18, yy + 38 + i * 36); c.set_source_rgba(1, 1, 1, k); c.show_text(l)
        c.restore(); yy += bh + 16
    nxt = [d for d, _, _ in o['msgs'] if d > t]
    if nxt and nxt[0] - t < .8:
        for i in range(3): c.set_source_rgba(.8, .8, .85, .5 + .5 * math.sin(t * 9 + i)); c.arc(x + 50 + i * 20, yy + 16, 5, 0, 6.3); c.fill()

def draw_punch(c, o, t, dur):
    k = min(1, t / .18); sc = 1.25 - .25 * k; fade = min(1, (dur - t) / .25)
    rect(c, 0, 0, W, H, (0, 0, 0), o.get('dim', .55) * fade)
    c.save(); c.translate(W / 2, o.get('y', 470)); c.scale(sc, sc)
    col = hx(o.get('color', '#ffffff'))
    lines = o['text'].split('\n')
    for i, l in enumerate(lines):
        sz = o.get('size', 76)
        c.select_font_face('DejaVu Serif', 0, 1); c.set_font_size(sz)
        centered(c, l, 0, i * (sz + 18), sz, col, serif=True, lw=0, a=fade)
    c.restore()
    if o.get('sub'): centered(c, o['sub'], W / 2, o.get('y', 470) + len(lines) * 96 + 20, 34, AMBER, a=fade)

def draw_title(c, o, t, dur):
    rect(c, 0, 0, W, H, (0, 0, 0), .5)
    k = min(1, t / .5); fade = min(1, (dur - t) / .3)
    glow(c, W / 2, 560, 360, hx('#1f9fb0'), .35 * k * fade)
    c.select_font_face('DejaVu Serif', 0, 1); c.set_font_size(176)
    txt = o.get('text', 'NOVA'); tw = c.text_extents(txt).x_advance
    c.save(); c.translate(0, (1 - k) * 30)
    gl = 6 * math.sin(t * 40) if (t < .4 or int(t * 8) % 11 == 0) else 0
    for off, col in ((-gl, (.2, .9, 1)), (gl, (1, .2, .3))): c.move_to(W / 2 - tw / 2 + off, 590); c.set_source_rgba(*col, .6 * fade); c.show_text(txt)
    c.move_to(W / 2 - tw / 2, 590); c.set_source_rgba(.95, .93, .88, k * fade); c.show_text(txt)
    c.restore()
    if o.get('sub'): centered(c, o['sub'], W / 2, 690, 34, AMBER, a=k * fade)
    if o.get('sub2'): centered(c, o['sub2'], W / 2, 750, 28, (.85, .85, .85), bold=False, a=k * fade)

def draw_clue(c, o, t, dur):
    rect(c, 0, 0, W, H, (0, 0, 0), .6); k = min(1, t / .3)
    c.save(); c.translate(W / 2, 480); c.rotate(-.05 * (1 - k) - .03); c.scale(.9 + .1 * k, .9 + .1 * k)
    rect(c, -290, -230, 580, 460, (0, 0, 0), .5); rect(c, -300, -240, 580, 460, hx('#e9dcc0'))
    c.set_source_rgb(*hx('#a1202a')); c.set_line_width(6); c.rectangle(-250, -205, 220, 54); c.stroke()
    centered(c, o.get('head', 'INDICE 01'), -140, -166, 30, hx('#a1202a'))
    big = len(o['text']) < 24
    c.select_font_face('DejaVu Serif', 0 if big else 2, 1 if big else 0); c.set_font_size(96 if big else 36)
    if big: centered(c, o['text'], -10, 70, 96, (.15, .1, .08), serif=True)
    else:
        for i, l in enumerate(text_lines(c, o['text'], 500)):
            c.move_to(-270, -90 + i * 52); c.set_source_rgb(.15, .1, .08); c.show_text(l)
    c.restore()

def draw_vote(c, o, t, dur):
    rect(c, 0, 0, W, H, (0, 0, 0), .72); k = min(1, t / .35)
    c.select_font_face(FONT, 0, 1); c.set_font_size(46)
    ls = text_lines(c, o['q'], 660)
    for i, l in enumerate(ls): centered(c, l, W / 2, 210 + i * 62, 46, lw=8)
    for j, (key, opt) in enumerate((('A', o['a']), ('B', o['b']))):
        top = 360 + j * 250 + (1 - k) * 60 * (1 if j else -1); pulse = .5 + .5 * math.sin(t * 4 + j * 3)
        rrect(c, 60, top, 600, 210, 30); c.set_source_rgba(0, 0, 0, .65 * k); c.fill_preserve()
        c.set_source_rgba(*AMBER, k * (.6 + .4 * pulse)); c.set_line_width(5); c.stroke()
        centered(c, key, 140, top + 135, 100, AMBER, serif=True, a=k)
        c.select_font_face(FONT, 0, 1); c.set_font_size(35)
        ol = text_lines(c, opt, 400)
        for i, l in enumerate(ol): c.move_to(215, top + 105 - 21 * (len(ol) - 1) + i * 44); c.set_source_rgba(1, 1, 1, k); c.show_text(l)
    centered(c, 'COMMENTE  A  OU  B', W / 2, 920, 40, AMBER, a=.7 + .3 * math.sin(t * 5))
    centered(c, 'le public décide de la suite', W / 2, 970, 26, (.9, .9, .9), bold=False)

def draw_loc(c, loc, t):
    k = min(1, t / .4) * min(1, (2.9 - t) / .4)
    if k <= 0: return
    c.save(); c.translate(0, (1 - k) * -14)
    centered(c, loc[0], W / 2, 235, 44, (1, 1, 1), lw=8, a=k)
    rect(c, W / 2 - 50, 250, 100, 3, AMBER, k)
    if len(loc) > 1: centered(c, loc[1], W / 2, 292, 28, AMBER, lw=6, a=k)
    c.restore()

class Scene:
    def __init__(self, bg, dur, actors=(), subs=(), loc=None, overlays=(), fx=(), sfx=(), cam=(1.05, 1.12, 360, 800),
                 cut=True, mood='calm', rain=False, tint=None):
        self.bgspec, self.dur = bg, dur; self.a = list(actors); self.subs = list(subs); self.loc = loc
        self.overlays = list(overlays); self.fx = list(fx); self.sfx = list(sfx); self.cam = cam
        self.cut = cut; self.mood = mood; self.tint = tint

def vkey(who):
    if not who: return 'narrateur'
    w = who.lower()
    if w.strip() == 'c.': return 'courtier'
    for k, v in (('nadège', 'nadege'), ('n. (', 'nadege'), ('amara', 'amara'), ('kofi', 'kofi'), ('karim', 'karim'), ('rédacteur', 'redac'),
                 ('courtier', 'courtier'), ('numéro', 'courtier'), ('léa', 'lea'), ('ibrahim', 'ibrahim'), ('fatou', 'fatou')):
        if k in w: return v
    return 'narrateur'

def voices(sc, t0, ev):
    for (a0, a1, who, txt) in sc.subs:
        ev.append((t0 + a0 + .05, 'voice', (tts.say(txt, vkey(who), a1 - a0 - .1),)))
    for o in sc.overlays:
        if o['type'] == 'phone':
            ms = o['msgs']
            for i, (dt, text, side) in enumerate(ms):
                nxt = ms[i + 1][0] if i + 1 < len(ms) else o['t1'] - .2
                if 'Envoyé' in text: continue
                ev.append((t0 + dt + .1, 'voice', (tts.say(text, vkey(o['who']), nxt - dt - .1),)))
        elif o['type'] == 'punch' and o.get('speak', True):
            ev.append((t0 + o['t0'] + .3, 'voice', (tts.say(o['text'].replace('\n', ' '), 'narrateur', o['t1'] - o['t0'] - .5),)))
        elif o['type'] == 'clue' and len(o['text']) > 24:
            ev.append((t0 + o['t0'] + .4, 'voice', (tts.say('Indice. ' + o['text'], 'narrateur', o['t1'] - o['t0'] - .5),)))
        elif o['type'] == 'vote':
            q = tts.say(o['q'], 'narrateur'); a = tts.say('Choix A. ' + o['a'], 'narrateur'); b = tts.say('Choix B. ' + o['b'], 'narrateur')
            t = t0 + o['t0'] + .6
            for y in (q, a, b): ev.append((t, 'voice', (y,))); t += len(y) / 44100 + .45
            ev.append((t + .1, 'voice', (tts.say('Commente A ou B. Tu décides.', 'narrateur'),)))

def render_video(path, scenes, tag, fps=FPS, still=None):
    total = sum(s.dur for s in scenes); out = os.path.abspath(path)
    ev = []; steps = []; t0 = 0.0; moods = []
    cmd = None
    if still is None:
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', '1080x1920', '-r', str(fps), '-i', '-']
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, 1080, 1920); c = cairo.Context(surf)
    plans = []
    for sc in scenes:
        b = bgs.make(sc.bgspec[0], **(sc.bgspec[1] if len(sc.bgspec) > 1 else {}))
        actors = [Actor(sc, d, sc.dur) for d in sc.a]
        plans.append((sc, b, None, actors, t0))
        for s_ in sc.sfx: ev.append((t0 + s_[1], s_[0], s_[2:]))
        moods.append((t0, t0 + sc.dur, sc.mood))
        if VOICES: voices(sc, t0, ev)
        for a in actors:   # pas auto
            last = -1
            for i in range(len(a.x)):
                if a.sp[i] > 8:
                    cyc = a.ph[i] / 3.1416
                    if int(cyc) != last and i / fps < sc.dur: ev.append((t0 + i / fps, 'step', (min(1, a.scale),))); last = int(cyc)
        t0 += sc.dur
    if still is None:
        wav = out + '.wav'
        sound.build(wav, total, ev, moods)
        cmd += ['-i', wav, '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-c:a', 'aac', '-b:a', '192k',
                '-movflags', '+faststart', '-shortest', out]
        pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n_done = 0
    for si, (sc, b, cache, actors, T0) in enumerate(plans):
        nfr = int(sc.dur * fps)
        cs = SC * min(2.0, max(sc.cam[0], sc.cam[1])); cache = cairo.ImageSurface(cairo.FORMAT_ARGB32, int(W * cs), int(H * cs))
        cc = cairo.Context(cache); cc.scale(cs, cs); b.static(cc)
        frames = range(nfr) if still is None else ([int(still[1] * fps)] if still[0] == si else [])
        for i in frames:
            t = i / fps
            c.set_operator(cairo.OPERATOR_SOURCE); c.set_source_rgb(0, 0, 0); c.paint(); c.set_operator(cairo.OPERATOR_OVER)
            c.save(); c.scale(SC, SC)
            z0, z1, fx = sc.cam[:3]; fy = sc.cam[3] if len(sc.cam) > 3 else 900
            k_ = t / sc.dur; k_ = k_ * k_ * (3 - 2 * k_) * .35 + k_ * .65; z = z0 + (z1 - z0) * k_
            sx = sy = 0
            for f in sc.fx:
                if f[0] == 'shake' and f[1] <= t <= f[2]:
                    amp = f[3] * (1 - (t - f[1]) / (f[2] - f[1] + 1e-6) * .6); sx += random.uniform(-amp, amp); sy += random.uniform(-amp, amp)
            cx = fx + (W / 2 - fx) * min(1, (z - 1) / .6); cy = fy + (600 - fy) * min(1, (z - 1) / .6)
            cx = min(max(cx, W - (W - fx) * z), fx * z); cy = min(max(cy, H - (H - fy) * z), fy * z)
            c.translate(sx, sy); c.translate(cx, cy); c.scale(z, z); c.translate(-fx, -fy)
            c.save(); c.scale(1 / cs, 1 / cs); c.set_source_surface(cache, 0, 0); c.paint(); c.restore()
            b.anim(c, t)
            for a in sorted(actors, key=lambda a: a.yb):
                a.draw(c, i, t, b.amb)
            b.front(c, t)
            for f in sc.fx:
                if f[0] == 'splash' and f[1] <= t <= f[1] + 1.6:
                    k = t - f[1]; x, y = f[2], f[3]
                    r_ = random.Random(4)
                    for j in range(26):
                        vx = r_.uniform(-140, 140); vy = -r_.uniform(160, 380); px = x + vx * k; py = y + vy * k + 520 * k * k
                        if py < y + 20: c.set_source_rgba(.8, .93, 1, max(0, 1 - k / 1.2)); c.arc(px, py, r_.uniform(2, 5), 0, 6.3); c.fill()
                    for j in range(3):
                        rr = (k * 160 - j * 38)
                        if rr > 0: c.save(); c.translate(x, y + 24); c.scale(1, .22); c.set_source_rgba(.8, .93, 1, max(0, .7 - k / 2)); c.set_line_width(5); c.arc(0, 0, rr, 0, 6.3); c.stroke(); c.restore()
            c.restore()
            # lumière globale (vignette)
            c.save(); c.scale(SC, SC)
            g = cairo.RadialGradient(W / 2, 640, 300, W / 2, 640, 900); g.add_color_stop_rgba(0, 0, 0, 0, 0); g.add_color_stop_rgba(1, 0, 0, 0, .65)
            c.set_source(g); c.rectangle(0, 0, W, H); c.fill()
            for f in sc.fx:
                if f[0] == 'flash' and f[1] <= t <= f[1] + f[2]:
                    rect(c, 0, 0, W, H, hx(f[3]) if len(f) > 3 else (1, 1, 1), .85 * (1 - (t - f[1]) / f[2]))
                if f[0] == 'redpulse' and f[1] <= t <= f[2]: rect(c, 0, 0, W, H, (.7, 0, .05), .18 + .12 * math.sin(t * 8))
            # ---- UI ----
            if sc.loc: draw_loc(c, sc.loc, t)
            for o in sc.overlays:
                if o['t0'] <= t < o['t1']:
                    lt, d = t - o['t0'], o['t1'] - o['t0']
                    {'phone': lambda: draw_phone(c, o, t), 'punch': lambda: draw_punch(c, o, lt, d), 'title': lambda: draw_title(c, o, lt, d),
                     'clue': lambda: draw_clue(c, o, lt, d), 'vote': lambda: draw_vote(c, o, lt, d)}[o['type']]()
            for (a0, a1, who, txt) in sc.subs:
                if a0 <= t < a1: draw_caption(c, who, txt, t - a0)
            # tag + barre de progression + fondu
            centered(c, tag, W / 2, 132, 20, (1, 1, 1), lw=5, a=.8)
            gt = T0 + t; rect(c, 0, H - 5, W * gt / total, 5, AMBER, .9)
            fade = 1.0
            if si == 0: fade = min(1, t / .25)
            if si == len(plans) - 1: fade = min(fade, (sc.dur - t) / .5)
            if not sc.cut: fade = min(fade, t / .25, (sc.dur - t) / .25)
            if fade < 1: rect(c, 0, 0, W, H, (0, 0, 0), 1 - fade)
            c.restore()
            if still is not None:
                surf.write_to_png(path); return
            pr.stdin.write(surf.get_data()); n_done += 1
        if still is None: print(f'  scène {si + 1}/{len(plans)}', flush=True)
    if still is None:
        pr.stdin.close(); pr.wait(); os.remove(wav); print('OK', out, f'{total:.0f}s', flush=True)
