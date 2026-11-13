#!/usr/bin/env python3
"""Moteur de vidéo "Le Monde, c'est vous" : épisode JSON -> MP4 vertical 9:16.
Usage: python3 render.py episodes/jour01.json [--fast]
Tout est gratuit : Python + Pillow + numpy + ffmpeg. Aucune clé API.
Si out/<jour>.mp3 (voix off) existe, elle est ajoutée automatiquement.
"""
import json, math, sys, os, subprocess, hashlib, colorsys
import numpy as np
import street, plateforme
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 720, 1280, 24
CX, CY, R = W // 2, 600, 300
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
F = lambda s: ImageFont.truetype(FONT_B, s)

OCEAN_TOP, OCEAN_BOT = (14, 24, 52), (30, 70, 120)
GREY = (74, 82, 96)
RED, GREEN, YELLOW, WHITE, NAVY = (231, 60, 60), (70, 230, 120), (255, 214, 64), (255, 255, 255), (22, 28, 64)

geo = json.load(open(os.path.join(os.path.dirname(__file__), "data/countries.geojson")))
COUNTRIES = {}
for ft in geo["features"]:
    g = ft["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    rings = [np.radians(np.array(p[0])) for p in polys]  # contour extérieur seulement
    COUNTRIES[ft["properties"]["NAME"]] = rings
CENTER = {n: (math.degrees(np.mean([r[:, 0].mean() for r in rs])), math.degrees(np.mean([r[:, 1].mean() for r in rs])))
          for n, rs in COUNTRIES.items()}


def color_of(name):
    h = int(hashlib.md5(name.encode()).hexdigest()[:6], 16)
    r, g, b = colorsys.hsv_to_rgb((h % 360) / 360, 0.55, 0.95)
    return int(r * 255), int(g * 255), int(b * 255)


def bg():
    a = np.linspace(0, 1, H)[:, None, None]
    img = (np.array(OCEAN_TOP) * (1 - a) + np.array(OCEAN_BOT) * a) * np.ones((H, W, 3))
    return Image.fromarray(img.astype("uint8"))


BG = bg()
rng = np.random.default_rng(3)
STARS = [(int(x), int(y), int(s)) for x, y, s in zip(rng.integers(0, W, 90), rng.integers(0, 380, 90), rng.integers(1, 3, 90))]


def project(ring, lon0, lat0):
    lam, phi = ring[:, 0] - lon0, ring[:, 1]
    x = np.cos(phi) * np.sin(lam)
    y = np.cos(lat0) * np.sin(phi) - np.sin(lat0) * np.cos(phi) * np.cos(lam)
    vis = np.sin(lat0) * np.sin(phi) + np.cos(lat0) * np.cos(phi) * np.cos(lam)
    n = np.hypot(x, y)
    hid = vis < 0
    x = np.where(hid, x / np.maximum(n, 1e-9), x)  # points cachés ramenés sur le bord
    y = np.where(hid, y / np.maximum(n, 1e-9), y)
    return x, y, vis


def draw_globe(img, lon0_deg, owners, pulse=None, lat0_deg=18):
    d = ImageDraw.Draw(img, "RGBA")
    for x, y, s in STARS:
        d.ellipse([x, y, x + s, y + s], fill=(255, 255, 255, 150))
    for k in range(5, 0, -1):  # halo
        d.ellipse([CX - R - k * 6, CY - R - k * 6, CX + R + k * 6, CY + R + k * 6], fill=(90, 160, 255, 7))
    d.ellipse([CX - R, CY - R, CX + R, CY + R], fill=(24, 56, 110))
    lon0, lat0 = math.radians(lon0_deg), math.radians(lat0_deg)
    for name, rings in COUNTRIES.items():
        col = color_of(name) if name in owners else GREY
        if pulse and name in pulse:
            col = YELLOW
        for ring in rings:
            x, y, vis = project(ring, lon0, lat0)
            if vis.max() < 0:
                continue
            pts = list(zip(CX + x * R, CY - y * R))
            if len(pts) >= 3:
                d.polygon(pts, fill=col + (255,), outline=(15, 20, 40, 255))
    # reflet
    d.ellipse([CX - R, CY - R, CX + R, CY + R], outline=(255, 255, 255, 80), width=3)
    d.ellipse([CX - R + 45, CY - R + 25, CX - R + 140, CY - R + 95], fill=(255, 255, 255, 22))


def center_text(d, y, text, font, fill, stroke=0, stroke_fill=(0, 0, 0)):
    w = d.textlength(text, font=font)
    d.text(((W - w) / 2, y), text, font=font, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)


def banner(img, label, title):
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([40, 70, W - 40, 190], 22, fill=(20, 26, 50, 215))
    center_text(d, 84, label.upper(), F(22), (225, 230, 245))
    fs = 46
    while d.textlength(title.upper(), font=F(fs)) > W - 110:
        fs -= 2
    center_text(d, 120, title.upper(), F(fs), RED, 2, (60, 0, 0))


def subtitle(img, words, k, accent):
    d = ImageDraw.Draw(img, "RGBA")
    shown = words[max(0, k - 1): k + 1] if k > 0 else words[:1]
    line = " ".join(shown)
    fs = 56
    while d.textlength(line, font=F(fs)) > W - 60 and fs > 24:
        fs -= 2
    center_text(d, 1000, line, F(fs), accent, 7, (0, 0, 0))


def card(img, c, t):
    """Carte « Avis à la population » (comme dans la vidéo de référence)."""
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([50, 230, W - 50, 960], 30, fill=(250, 244, 230, 245), outline=NAVY, width=6)
    center_text(d, 252, c["header"].upper(), F(20), (150, 80, 60))
    qs = 32
    while d.textlength(c["question"].upper(), font=F(qs)) > W - 130:
        qs -= 2
    center_text(d, 290, c["question"].upper(), F(qs), NAVY)
    ys = 360
    for i, (letter, label) in enumerate(c["choices"]):
        prog = min(1, max(0, (t - 0.35 * i) / 0.4))
        if prog <= 0:
            continue
        off = int((1 - prog) * 400)
        col = [(231, 60, 60), (60, 120, 230), (130, 80, 220), (240, 160, 40)][i % 4]
        d.rounded_rectangle([80 + off, ys, W - 80 + off, ys + 150], 22, fill=(255, 255, 255), outline=NAVY, width=4)
        d.rounded_rectangle([98 + off, ys + 22, 98 + 105 + off, ys + 128], 16, fill=col)
        d.text((98 + 52 + off, ys + 75), letter, font=F(64), fill=WHITE, anchor="mm")
        lines = label.split("\n")
        for j, ln in enumerate(lines):
            d.text((230 + off, ys + 40 + j * 44), ln, font=F(34 if j == 0 else 28), fill=NAVY if j == 0 else col)
        ys += 175
    if c.get("footer"):
        d.rounded_rectangle([70, 880, W - 70, 940], 14, fill=NAVY)
        center_text(d, 897, c["footer"].upper(), F(19), WHITE)


def counter(img, label, value):
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([W / 2 - 150, 215, W / 2 + 150, 330], 20, fill=(15, 20, 45, 230), outline=(70, 230, 120), width=4)
    center_text(d, 224, label.upper(), F(20), (70, 230, 120))
    center_text(d, 252, str(value), F(66), (70, 230, 120))


def hud(img, items):
    d = ImageDraw.Draw(img, "RGBA")
    for i, (lab, val) in enumerate(items):
        x0 = 60 + i * 310
        d.rounded_rectangle([x0, 205, x0 + 290, 280], 16, fill=(15, 20, 45, 225), outline=(70, 230, 120) if i == 0 else (120, 180, 255), width=3)
        d.text((x0 + 18, 213), lab.upper(), font=F(17), fill=(200, 210, 240))
        d.text((x0 + 272, 262), str(val), font=F(36), fill=(70, 230, 120) if i == 0 else (120, 180, 255), anchor="rd")


def bubble(img, items):
    d = ImageDraw.Draw(img, "RGBA")
    for (name, who, x, y) in items:
        d.rounded_rectangle([x, y, x + 300, y + 62], 14, fill=(255, 255, 255, 240))
        d.text((x + 14, y + 8), who, font=F(16), fill=(90, 90, 110))
        d.text((x + 14, y + 30), name, font=F(22), fill=NAVY)


def frame(ep, scene, t, gt, state):
    img = BG.copy()
    lon0 = ep.get("lon_start", 10) + gt * ep.get("spin", 14)
    if "focus" in scene:
        # glisse vers le pays ciblé
        tx = CENTER[scene["focus"]][0]
        a = min(1, t / 1.2)
        lon0 = (1 - a) * lon0 + a * tx
    owners = set(scene.get("owners", [])) | set(state.get("owners", []))
    n = len(owners)
    if scene.get("reveal"):  # les pays s'allument un par un
        lst = scene["reveal"]
        k = int(len(lst) * min(1, t / (scene["dur"] * 0.8)))
        owners = set(lst[:k]) | set(state.get("owners", []))
        n = len(owners)
    if scene.get("all"):
        owners = set(COUNTRIES); n = len(owners)
    if scene.get("grey"):
        owners = set()
    pulse = set(scene.get("pulse", [])) if int(t * 3) % 2 == 0 else set()
    if scene.get("map") is not None:
        img = plateforme.draw(BG, scene["map"], t / scene["dur"], W, H)
    elif scene.get("street"):
        img = street.draw(scene["street"], t / scene["dur"], W, H)
    elif not scene.get("card"):
        draw_globe(img, lon0, owners, pulse)
    else:
        draw_globe(img, lon0, owners, pulse)
        img = Image.blend(img, Image.new("RGB", (W, H), (10, 14, 34)), 0.68)
    if scene.get("banner"):
        banner(img, *scene["banner"])
    if scene.get("counter"):
        a = scene["counter"]
        val = int(a[1] + (a[2] - a[1]) * min(1, t / (scene["dur"] * 0.8)))
        counter(img, a[0], val)
    if scene.get("hud"):
        hud(img, scene["hud"])
    if scene.get("bubbles"):
        bubble(img, scene["bubbles"])
    if scene.get("card"):
        card(img, scene["card"], t)
    words = scene["voice"].split()
    k = int(len(words) * min(0.999, t / scene["dur"])) if words else 0
    subtitle(img, words, k, GREEN if scene.get("green") else YELLOW)
    d = ImageDraw.Draw(img, "RGBA")
    d.text((W - 26, H - 40), ep.get("handle", "@lemonde.cestvous"), font=F(20), fill=(255, 255, 255, 190), anchor="ra")
    return img


def main():
    path = sys.argv[1]
    fast = "--fast" in sys.argv
    ep = json.load(open(path))
    day = os.path.splitext(os.path.basename(path))[0]
    state = json.load(open(os.path.join(os.path.dirname(path), "..", "state.json"))) if os.path.exists(
        os.path.join(os.path.dirname(path), "..", "state.json")) else {"owners": []}
    out = f"out/{day}"
    os.makedirs("out", exist_ok=True)
    fps = 12 if fast else FPS
    dj = f"out/{day}_dur.json"
    if os.path.exists(dj):  # durées calées sur la voix off
        for sc, dd in zip(ep["scenes"], json.load(open(dj))):
            sc["dur"] = dd
    total = sum(s["dur"] for s in ep["scenes"])
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(fps), "-i", "-"]
    audio = next((a for a in (f"{out}.wav", f"{out}.mp3") if os.path.exists(a)), "")
    if audio:
        cmd += ["-i", audio, "-af", "highpass=f=80,loudnorm=I=-13:TP=-1:LRA=7", "-ar", "44100", "-ac", "2", "-c:a", "aac", "-b:a", "192k", "-shortest"]
    cmd += ["-vf", "scale=720:1280", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "20", f"{out}.mp4"]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    gt = 0.0
    for sc in ep["scenes"]:
        for i in range(int(sc["dur"] * fps)):
            t = i / fps
            im = frame(ep, sc, t, gt + t, state)
            im.save(p.stdin, "JPEG", quality=92)
        gt += sc["dur"]
    p.stdin.close(); p.wait()
    # texte de la voix off, scène par scène, pour la voix
    with open(f"{out}_voix.txt", "w") as f:
        f.write("\n".join(s["voice"] for s in ep["scenes"]))
    print(f"OK {out}.mp4  ({total:.0f}s)")


if __name__ == "__main__":
    main()
