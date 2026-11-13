"""Scènes football : terrain vu de dessus avec tribunes, 11 postes, trophées."""
import math, random
from PIL import Image, ImageDraw, ImageFont

FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
S = 2
PW, PH = 640, 620
OX, OY = 40, 290
TRIBUNE = 38
GRASS = [(44, 138, 64), (52, 152, 74)]
JERSEY = (250, 200, 40)

# 4-3-3 : (code, x, y) ; y=0 haut (attaque), y=1 bas (gardien)
SLOTS = [("AG", .2, .17), ("AC", .5, .11), ("AD", .8, .17), ("MG", .25, .40), ("MC", .5, .45), ("MD", .75, .40),
         ("DG", .12, .66), ("DC", .37, .70), ("DC", .63, .70), ("DD", .88, .66), ("GB", .5, .90)]


def f(sz):
    return ImageFont.truetype(FONT_B, int(sz * S))


def ease(u):
    u = max(0, min(1, u)); return u * u * (3 - 2 * u)


def pitch(spec, tf):
    w, h = PW * S, PH * S
    img = Image.new("RGB", (w, h), (70, 76, 100))
    d = ImageDraw.Draw(img, "RGBA")
    # tribunes + public
    rnd = random.Random(11)
    crowd = spec.get("crowd", 0.15)
    for _ in range(int(2600 * crowd)):
        side = rnd.random()
        if side < 0.5:
            x = rnd.uniform(4, PW - 4); y = rnd.choice([rnd.uniform(4, TRIBUNE - 6), rnd.uniform(PH - TRIBUNE + 6, PH - 4)])
        else:
            y = rnd.uniform(4, PH - 4); x = rnd.choice([rnd.uniform(4, TRIBUNE - 6), rnd.uniform(PW - TRIBUNE + 6, PW - 4)])
        c = rnd.choice([(231, 76, 60), (241, 196, 15), (255, 255, 255), (52, 152, 219), (46, 204, 113)])
        d.ellipse([(x - 4) * S, (y - 4) * S, (x + 4) * S, (y + 4) * S], fill=c)
    # pelouse
    gx0, gy0, gx1, gy1 = TRIBUNE * S, TRIBUNE * S, (PW - TRIBUNE) * S, (PH - TRIBUNE) * S
    n = 12
    bh = (gy1 - gy0) / n
    for i in range(n):
        d.rectangle([gx0, gy0 + i * bh, gx1, gy0 + (i + 1) * bh], fill=GRASS[i % 2])
    if spec.get("worn"):  # pelouse abîmée
        r2 = random.Random(3)
        for _ in range(26):
            x = r2.uniform(gx0, gx1); y = r2.uniform(gy0, gy1); rr = r2.uniform(14, 34) * S
            d.ellipse([x - rr, y - rr * 0.7, x + rr, y + rr * 0.7], fill=(150, 112, 62, 190))
    line = (255, 255, 255, 235); lw = 3 * S
    d.rectangle([gx0 + 10 * S, gy0 + 10 * S, gx1 - 10 * S, gy1 - 10 * S], outline=line, width=lw)
    cy = (gy0 + gy1) / 2
    d.line([(gx0 + 10 * S, cy), (gx1 - 10 * S, cy)], fill=line, width=lw)
    cx = (gx0 + gx1) / 2
    d.ellipse([cx - 52 * S, cy - 52 * S, cx + 52 * S, cy + 52 * S], outline=line, width=lw)
    for top in (True, False):
        yy0 = gy0 + 10 * S if top else gy1 - 10 * S - 90 * S
        d.rectangle([cx - 110 * S, yy0, cx + 110 * S, yy0 + 90 * S], outline=line, width=lw)
        yy1 = gy0 + 10 * S if top else gy1 - 10 * S - 40 * S
        d.rectangle([cx - 50 * S, yy1, cx + 50 * S, yy1 + 40 * S], outline=line, width=lw)
    # joueurs / postes
    px0, py0, pw_, ph_ = gx0 + 10 * S, gy0 + 10 * S, gx1 - gx0 - 20 * S, gy1 - gy0 - 20 * S
    filled = spec.get("filled", 0)
    for i, (code, sx, sy) in enumerate(SLOTS):
        t0 = 0.1 + 0.75 * i / len(SLOTS)
        a = ease((tf - t0) / 0.12)
        if a <= 0 or not spec.get("slots", True):
            continue
        x, y = px0 + sx * pw_, py0 + sy * ph_
        r = 27 * S * (0.4 + 0.6 * a)
        d.ellipse([x - r, y - r + 6 * S, x + r, y + r + 6 * S], fill=(0, 0, 0, 70))
        if i < filled:
            d.ellipse([x - r, y - r, x + r, y + r], fill=JERSEY, outline=(30, 30, 30), width=3 * S)
            d.text((x, y), code, font=f(20 * a + 1), fill=(30, 30, 30), anchor="mm")
        else:
            pulse = 0.5 + 0.5 * math.sin(tf * 9 + i)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(20, 40, 30, int(120 + 60 * pulse)), outline=(255, 255, 255, 255), width=3 * S)
            d.text((x, y - 2 * S), "?", font=f(30 * a + 1), fill=(255, 255, 255), anchor="mm")
            d.text((x, y + r + 12 * S), code, font=f(17 * a + 1), fill=(255, 255, 255), anchor="mm", stroke_width=S, stroke_fill=(10, 40, 20))
    # ballon
    if spec.get("ball"):
        bx = cx + math.sin(tf * 5) * 60 * S; by = cy + math.cos(tf * 7) * 30 * S
        d.ellipse([bx - 11 * S, by - 11 * S, bx + 11 * S, by + 11 * S], fill=(255, 255, 255), outline=(20, 20, 20), width=2 * S)
    return img.resize((PW, PH), Image.LANCZOS)


def cup(d, cx, cy, sc, col):
    s = sc
    d.polygon([(cx - 60 * s, cy - 90 * s), (cx + 60 * s, cy - 90 * s), (cx + 40 * s, cy - 10 * s), (cx - 40 * s, cy - 10 * s)], fill=col, outline=(120, 80, 10), width=int(4 * s))
    d.arc([cx - 100 * s, cy - 80 * s, cx - 40 * s, cy - 30 * s], 90, 270, fill=col, width=int(10 * s))
    d.arc([cx + 40 * s, cy - 80 * s, cx + 100 * s, cy - 30 * s], 270, 90, fill=col, width=int(10 * s))
    d.rectangle([cx - 10 * s, cy - 10 * s, cx + 10 * s, cy + 40 * s], fill=col)
    d.rounded_rectangle([cx - 50 * s, cy + 40 * s, cx + 50 * s, cy + 70 * s], 8 * s, fill=(90, 60, 20))


def draw(bg, spec, tf, W=720, H=1280):
    img = bg.copy()
    d = ImageDraw.Draw(img, "RGBA")
    if spec.get("trophies"):
        names = spec["trophies"]
        for i, nm in enumerate(names):
            a = ease((tf - 0.15 * i) / 0.3)
            cy = 520 + i * 330
            cx = W / 2
            cup(d, cx, cy + (1 - a) * 80, 1.05 * (0.6 + 0.4 * a), (250, 205, 60) if i == 0 else (225, 230, 245))
            ft = ImageFont.truetype(FONT_B, 34)
            d.text((cx, cy + 105), nm, font=ft, fill=(255, 255, 255), anchor="mm", stroke_width=4, stroke_fill=(16, 22, 42))
        return img
    p = pitch(spec, tf)
    d.rounded_rectangle([OX - 8, OY + 6, OX + PW + 8, OY + PH + 22], 20, fill=(24, 30, 56))
    d.rounded_rectangle([OX - 8, OY - 8, OX + PW + 8, OY + PH + 8], 20, fill=(52, 64, 108))
    img.paste(p, (OX, OY))
    d = ImageDraw.Draw(img, "RGBA")
    if spec.get("club"):
        d.rounded_rectangle([OX + 150, OY + PH - 62, OX + PW - 150, OY + PH - 14], 14, fill=(15, 20, 45, 235), outline=(250, 200, 40), width=3)
        d.text((OX + PW / 2, OY + PH - 38), spec["club"], font=ImageFont.truetype(FONT_B, 28), fill=(250, 200, 40), anchor="mm")
    return img
