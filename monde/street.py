"""Scènes « rue » : petits personnages animés (président, ministres, citoyens, gangs).
Dessinées en 2x puis réduites pour des bords lisses. Les temps sont des fractions (0..1) de la scène."""
import math, random
from PIL import Image, ImageDraw, ImageFont

FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
S = 2
SKINS = [(255, 214, 170), (224, 172, 120), (180, 122, 80), (130, 86, 56), (98, 62, 42)]
HAIRS = [(30, 24, 22), (60, 40, 30), (20, 20, 20), (110, 70, 40)]
SHIRTS = [(231, 76, 60), (52, 152, 219), (241, 196, 15), (46, 204, 113), (155, 89, 182), (230, 126, 34), (26, 188, 156)]


def font(sz):
    return ImageFont.truetype(FONT_B, int(sz * S))


def ease(u):
    u = max(0.0, min(1.0, u))
    return u * u * (3 - 2 * u)


def lerp(a, b, e):
    return a + (b - a) * e


SKY = {"day": ((120, 190, 245), (255, 226, 190)), "dusk": ((58, 40, 98), (240, 130, 90)), "night": ((14, 20, 50), (50, 60, 110))}


def background(w, h, sky, tf):
    top, bot = SKY[sky]
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    horizon = 800 * S
    for y in range(0, horizon, 4):
        a = y / horizon
        d.rectangle([0, y, w, y + 4], fill=tuple(int(top[i] * (1 - a) + bot[i] * a) for i in range(3)))
    # soleil / lune
    sx = (560 - tf * 40) * S
    d.ellipse([sx - 60 * S, 330 * S - 60 * S, sx + 60 * S, 330 * S + 60 * S], fill=((255, 240, 190) if sky == "day" else (255, 170, 90)) if sky != "night" else (235, 235, 250))
    rnd = random.Random(7)
    for layer, (base, hmin, hmax, shade, drift) in enumerate([(800, 140, 260, 0.78, 10), (820, 200, 380, 1.0, 25)]):
        x = -80 - tf * drift
        while x < 800:
            bw = rnd.randint(90, 150)
            bh = rnd.randint(hmin, hmax)
            c = rnd.choice([(235, 140, 110), (120, 170, 220), (245, 205, 110), (150, 200, 150), (200, 150, 210)])
            c = tuple(int(v * shade) for v in c)
            if sky != "day":
                c = tuple(int(v * 0.55) for v in c)
            d.rectangle([x * S, (base - bh) * S, (x + bw) * S, base * S], fill=c)
            d.rectangle([x * S, (base - bh) * S, (x + bw) * S, (base - bh + 14) * S], fill=tuple(int(v * 0.8) for v in c))
            for wy in range(base - bh + 34, base - 40, 44):
                for wx in range(int(x) + 16, int(x) + bw - 24, 34):
                    lit = sky != "day" and rnd.random() < 0.6
                    d.rectangle([wx * S, wy * S, (wx + 18) * S, (wy + 24) * S], fill=(255, 224, 120) if lit else (250, 250, 255) if sky == "day" else (40, 44, 70))
            x += bw + rnd.randint(4, 14)
    # trottoir + route
    d.rectangle([0, 800 * S, w, 850 * S], fill=(200, 196, 190) if sky == "day" else (110, 104, 118))
    d.rectangle([0, 850 * S, w, h], fill=(96, 100, 112) if sky == "day" else (52, 52, 70))
    for xx in range(-int(tf * 90) % 120 - 120, 800, 120):
        d.rectangle([xx * S, 1130 * S, (xx + 60) * S, 1140 * S], fill=(235, 235, 235))
    return img, d


def bag(d, x, y, sc):
    d.rounded_rectangle([x - 16 * sc * S, y - 4 * sc * S, x + 16 * sc * S, y + 30 * sc * S], 8 * sc * S, fill=(40, 120, 70), outline=(15, 60, 35), width=2 * S)
    d.text((x, y + 13 * sc * S), "$", font=font(20 * sc), fill=(255, 235, 120), anchor="mm")


def person(d, x, y, sc, role, phase, face, look, run=False, up=False, carry=False, talk=0.0):
    """x,y en pixels 2x (pieds). face = +1 droite / -1 gauche."""
    s = sc * S
    bob = abs(math.sin(phase)) * (7 if run else 4) * s
    y0 = y - bob
    d.ellipse([x - 30 * s, y - 7 * s, x + 30 * s, y + 9 * s], fill=(0, 0, 0, 60))
    shirt = look["shirt"]
    pants = (45, 52, 80)
    if role == "president":
        shirt, pants = (28, 40, 78), (24, 30, 60)
    elif role == "minister":
        shirt, pants = (76, 88, 110), (50, 58, 78)
    elif role == "gang":
        shirt, pants = (28, 28, 34), (20, 20, 26)
    sw = math.sin(phase) * (16 if run else 11) * s
    # jambes
    for sgn in (-1, 1):
        lx = x + sgn * 11 * s + sgn * sw * 0.8
        d.rounded_rectangle([lx - 8 * s, y0 - 58 * s, lx + 8 * s, y0], 6 * s, fill=pants)
        d.rounded_rectangle([lx - 10 * s + face * 3 * s, y0 - 8 * s, lx + 10 * s + face * 3 * s, y0 + 2 * s], 5 * s, fill=(36, 30, 30))
    # corps
    d.rounded_rectangle([x - 26 * s, y0 - 112 * s, x + 26 * s, y0 - 50 * s], 16 * s, fill=shirt)
    if role == "president":  # écharpe
        d.polygon([(x - 26 * s, y0 - 104 * s), (x - 12 * s, y0 - 110 * s), (x + 26 * s, y0 - 62 * s), (x + 12 * s, y0 - 52 * s)], fill=(46, 170, 90))
        d.line([(x - 19 * s, y0 - 107 * s), (x + 19 * s, y0 - 57 * s)], fill=(255, 220, 90), width=int(4 * s))
    if role == "minister":  # cravate
        d.polygon([(x - 6 * s, y0 - 108 * s), (x + 6 * s, y0 - 108 * s), (x + 4 * s, y0 - 74 * s), (x, y0 - 66 * s), (x - 4 * s, y0 - 74 * s)], fill=(210, 50, 50))
    # bras
    for sgn in (-1, 1):
        shx, shy = x + sgn * 26 * s, y0 - 100 * s
        if up:
            hx, hy = x + sgn * 38 * s, y0 - 150 * s + math.sin(phase * 1.5 + sgn) * 8 * s
        else:
            hx, hy = x + sgn * 31 * s - sgn * sw * 0.6, y0 - 60 * s
        d.line([(shx, shy), (hx, hy)], fill=shirt, width=int(13 * s))
        d.ellipse([hx - 7 * s, hy - 7 * s, hx + 7 * s, hy + 7 * s], fill=look["skin"])
    if carry:
        if role == "minister":
            d.rounded_rectangle([x + face * 40 * s - 18 * s, y0 - 62 * s, x + face * 40 * s + 18 * s, y0 - 36 * s], 4 * s, fill=(120, 74, 40))
        else:
            bag(d, x + face * 40 * s, y0 - 56 * s, sc * 1.0)
    # tête
    hy = y0 - 134 * s
    if role == "gang":
        d.ellipse([x - 30 * s, hy - 30 * s, x + 30 * s, hy + 30 * s], fill=(22, 22, 28))  # capuche
        d.ellipse([x - 21 * s, hy - 16 * s, x + 21 * s, hy + 22 * s], fill=look["skin"])
        d.rectangle([x - 21 * s, hy + 4 * s, x + 21 * s, hy + 22 * s], fill=(70, 70, 78))  # masque
        d.line([(x - 14 * s, hy - 4 * s), (x - 4 * s, hy - 1 * s)], fill=(10, 10, 10), width=int(4 * s))
        d.line([(x + 14 * s, hy - 4 * s), (x + 4 * s, hy - 1 * s)], fill=(10, 10, 10), width=int(4 * s))
    else:
        d.ellipse([x - 24 * s, hy - 24 * s, x + 24 * s, hy + 24 * s], fill=look["skin"])
        d.pieslice([x - 26 * s, hy - 28 * s, x + 26 * s, hy + 20 * s], 180, 360, fill=look["hair"])
        for sgn in (-1, 1):
            d.ellipse([x + sgn * 9 * s + face * 3 * s - 3 * s, hy - 3 * s, x + sgn * 9 * s + face * 3 * s + 3 * s, hy + 3 * s + 2 * s], fill=(20, 20, 20))
        mo = 3 + 4 * abs(math.sin(talk * 14)) if talk else 3
        d.arc([x - 8 * s + face * 3 * s, hy + 6 * s, x + 8 * s + face * 3 * s, hy + (6 + mo) * s + 8 * s], 10, 170, fill=(120, 40, 40), width=int(2.5 * s))
        if role == "president":
            d.rectangle([x - 22 * s, hy - 34 * s, x + 22 * s, hy - 24 * s], fill=(46, 170, 90))  # képi


def bubble(d, x, y, text):
    f = font(26)
    w = d.textlength(text, font=f) + 28 * S
    h = 46 * S
    x0, y0 = x - w / 2, y - h
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], 16 * S, fill=(255, 255, 255), outline=(30, 30, 60), width=3 * S)
    d.polygon([(x - 8 * S, y0 + h - 2), (x + 8 * S, y0 + h - 2), (x, y0 + h + 14 * S)], fill=(255, 255, 255), outline=(30, 30, 60))
    d.rectangle([x - 6 * S, y0 + h - 4, x + 6 * S, y0 + h], fill=(255, 255, 255))
    d.text((x0 + w / 2, y0 + h / 2), text, font=f, fill=(25, 28, 64), anchor="mm")


def draw(spec, tf, W, H):
    img, d = background(W * S, H * S, spec.get("sky", "day"), tf)
    d = ImageDraw.Draw(img, "RGBA")
    items = []
    for i, a in enumerate(spec["actors"]):
        rnd = random.Random(a.get("seed", i * 13 + 5))
        look = {"skin": rnd.choice(SKINS), "hair": rnd.choice(HAIRS), "shirt": a.get("color") and tuple(a["color"]) or rnd.choice(SHIRTS)}
        x0, x1 = a["x"] if isinstance(a["x"], list) else (a["x"], a["x"])
        t0, t1 = a.get("t", [0, 1])
        u = 0 if t1 == t0 else (tf - t0) / (t1 - t0)
        e = ease(u)
        x = lerp(x0, x1, e)
        moving = 0 < u < 1 and x0 != x1
        face = a.get("face", 1 if x1 >= x0 else -1)
        if x0 != x1 and moving:
            face = 1 if x1 > x0 else -1
        ya = a.get("y", 0.5)
        yp = 880 + ya * 80
        sc = 1.05 + ya * 0.3
        run = a.get("run") and moving
        phase = tf * (34 if run else 20) * 1.0 + i if moving else 0.0
        car = a.get("carry")
        carry = bool(car) and car[0] <= tf <= car[1]
        up = bool(a.get("up")) and tf >= a["up"][0] and tf <= a["up"][1] if isinstance(a.get("up"), list) else bool(a.get("up"))
        sh = a.get("show")
        if sh and not (sh[0] <= tf <= sh[1]):
            continue
        items.append((yp, x * W * S, sc, a["role"], phase, face, look, run, up, carry, i))
    talks = {}
    for sy in spec.get("say", []):
        if sy["t"][0] <= tf <= sy["t"][1]:
            talks[sy["actor"]] = sy
    for yp, xp, sc, role, phase, face, look, run, up, carry, i in sorted(items, key=lambda z: z[0]):
        if xp < -80 * S or xp > (W + 80) * S:
            continue
        person(d, xp, yp * S, sc, role, phase, face, look, run, up, carry, tf if i in talks else 0.0)
    for i, sy in talks.items():
        it = next((z for z in items if z[10] == i), None)
        if it:
            bubble(d, it[1], (it[0] - 190 * it[2]) * S, sy["text"])
    return img.resize((W, H), Image.LANCZOS)
