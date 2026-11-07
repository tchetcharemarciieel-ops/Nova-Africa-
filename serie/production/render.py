#!/usr/bin/env python3
"""Rend les vidéos verticales (1080x1920) de la série NOVA en motion design.
Usage: python3 render.py [nom ...]   (sans argument: tout)"""
import subprocess, sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 24
OUT = os.path.join(os.path.dirname(__file__), "..", "videos")
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FS = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
TEAL, AMBER, RED = (20, 90, 100), (200, 120, 30), (140, 25, 35)
COL = {"teal": TEAL, "amber": AMBER, "red": RED, "dark": (10, 12, 20)}

def font(p, s): return ImageFont.truetype(p, s)

def wrap(draw, text, f, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    return lines + [cur]

def text_layer(card):
    """Calque RGBA statique pour une carte."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    kind, txt = card["k"], card["t"]
    if kind == "title":
        f = font(FS, card.get("size", 210))
        for i, l in enumerate(wrap(d, txt, f, W - 120)):
            d.text((W/2, H/2 - 60 + i*(f.size+20)), l, font=f, fill=(240, 235, 225, 255), anchor="mm")
        if card.get("sub"):
            d.text((W/2, H/2 + 190), card["sub"], font=font(FB, 44), fill=(*AMBER, 255), anchor="mm")
    elif kind == "place":
        f = font(FB, 54)
        for i, l in enumerate(wrap(d, txt, f, W - 200)):
            d.text((W/2, H/2 + i*76), l, font=f, fill=(*AMBER, 255), anchor="mm")
        d.line([(W/2-120, H/2-80), (W/2+120, H/2-80)], fill=(*AMBER, 255), width=4)
    elif kind == "narr":
        f = font(FS, 72)
        ls = wrap(d, txt, f, W - 200); y0 = H/2 - len(ls)*50
        for i, l in enumerate(ls):
            d.text((W/2, y0 + i*100), l, font=f, fill=(235, 232, 225, 255), anchor="mm")
    elif kind == "line":
        f = font(FB, 66)
        ls = wrap(d, txt, f, W - 180); y0 = H/2 - len(ls)*50 + 40
        d.text((W/2, y0 - 130), card["who"].upper(), font=font(FB, 46), fill=(*AMBER, 255), anchor="mm")
        for i, l in enumerate(ls):
            d.text((W/2, y0 + i*92), l, font=f, fill=(245, 245, 245, 255), anchor="mm")
    elif kind == "end":
        d.text((W/2, H/2), txt, font=font(FS, 80), fill=(235, 232, 225, 255), anchor="mm")
        d.text((W/2, H/2 + 130), card.get("sub", ""), font=font(FB, 44), fill=(*AMBER, 255), anchor="mm")
    return np.asarray(im, dtype=np.float32) / 255.0

def dur(c):
    return c.get("d") or max(2.4, min(7.0, 1.6 + len(c["t"]) * 0.055))

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
rng = np.random.default_rng(7)
bars = np.ones((H, W, 1), np.float32); bars[:170] = 0; bars[-170:] = 0

def render(name, cards, tag, bpm=54):
    path = os.path.abspath(os.path.join(OUT, name + ".mp4")); os.makedirs(OUT, exist_ok=True)
    total = sum(dur(c) for c in cards) + 0.0
    nfr = int(total * FPS)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-f", "lavfi", "-i", f"sine=f=55:d={total}", "-f", "lavfi", "-i", f"sine=f=82.4:d={total}",
           "-f", "lavfi", "-i", f"anoisesrc=c=brown:a=0.25:d={total}",
           "-filter_complex",
           f"[1][2]amix=inputs=2,tremolo=f={bpm/60:.2f}:d=0.6[a];[3]lowpass=f=300[n];"
           f"[a][n]amix=inputs=2:weights=1 0.6,volume=0.8,afade=t=in:d=1,afade=t=out:st={total-1.2}:d=1.2[o]",
           "-map", "0:v", "-map", "[o]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "26",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-shortest", path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    fnt_tag = None
    f = 0
    for c in cards:
        n = int(dur(c) * FPS); layer = text_layer(c); col = np.array(COL[c.get("bg", "dark")], np.float32) / 255
        a_layer = layer[..., 3:4]; rgb = layer[..., :3]
        for i in range(n):
            t = i / FPS; D = n / FPS
            cx = W*(0.5 + 0.12*math.sin(f/FPS*0.35)); cy = H*(0.45 + 0.08*math.cos(f/FPS*0.27))
            r = np.sqrt((xx-cx)**2 + (yy-cy)**2) / (H*0.75)
            g = np.clip(1 - r, 0, 1)[..., None] ** 1.6
            bg = col[None, None, :] * g * 0.9 + 0.015
            vig = np.clip(1 - 0.55*((xx-W/2)/(W/2))**2 - 0.35*((yy-H/2)/(H/2))**2, 0.15, 1)[..., None]
            bg *= vig
            bg += rng.normal(0, 0.006, (H, W, 1)).astype(np.float32)
            fade = min(1, t/0.45, (D - t)/0.35)
            fade = max(0.0, fade)
            if c["k"] == "black": a = 0
            else: a = fade
            shift = int((1 - min(1, t/0.6)) * 28)
            al = np.roll(a_layer, shift, axis=0) * a; rg = np.roll(rgb, shift, axis=0)
            fr = bg * (1 - al) + rg * al
            # barre de progression + étiquette
            fr = fr * bars
            prog = int(W * f / nfr); fr[H-14:H, :prog] = np.array(AMBER, np.float32)/255
            img = Image.fromarray((np.clip(fr, 0, 1) * 255).astype(np.uint8))
            ImageDraw.Draw(img).text((W/2, 105), tag, font=font(FB, 34), fill=(190, 190, 190), anchor="mm")
            p.stdin.write(img.tobytes()); f += 1
    p.stdin.close(); p.wait(); print("OK", path, f"{total:.0f}s")

L = lambda who, t, **k: {"k": "line", "who": who, "t": t, **k}
P = lambda t, **k: {"k": "place", "t": t, **k}
N = lambda t, **k: {"k": "narr", "t": t, **k}
B = lambda d=1.2: {"k": "black", "t": "", "d": d}

EP1 = {
 "nova_ep01_partie1": ("NOVA · ÉP.1 « LA VEILLE » · 1/3", 54, [
   {"k": "title", "t": "NOVA", "sub": "ÉPISODE 1 — LA VEILLE", "d": 4, "bg": "teal"},
   P("LAGUNE EBRIÉ, ABIDJAN — NUIT", bg="teal"),
   N("La veille du lancement de la monnaie NOVA.", bg="teal"),
   L("Nadège Okoye", "Amara, si tu écoutes ça, c'est que je n'ai pas pu te le dire en face.", bg="teal"),
   L("Nadège Okoye", "Ne fais confiance à personne chez NOVA. Pas même à moi.", bg="teal"),
   N("Un bruit, derrière elle…", bg="red"), B(1.6),
   P("DAKAR — LE LENDEMAIN MATIN", bg="amber"),
   N("« La PDG de NOVA retrouvée morte dans la lagune. »", bg="amber"),
   L("Le rédacteur", "Amara, ce n'est pas ton dossier.", bg="amber"),
   L("Amara", "Elle m'a écrit avant de mourir. C'est mon dossier.", bg="amber"),
   P("LAGUNE — ABIDJAN", bg="teal"),
   N("Une clé USB cachée dans la doublure de sa robe.", bg="teal"),
   L("Inspecteur Kofi", "Quelqu'un voulait qu'on la trouve.", bg="teal"),
   {"k": "end", "t": "À suivre…", "sub": "PARTIE 2 / 3", "d": 3.5, "bg": "dark"}]),
 "nova_ep01_partie2": ("NOVA · ÉP.1 « LA VEILLE » · 2/3", 60, [
   P("SIÈGE DE NOVA, KINSHASA", bg="teal"),
   N("Quelqu'un efface des traces. Vite.", bg="teal"),
   L("Léa", "Le lancement aura lieu. Même sans elle.", bg="teal"),
   N("Accès distant détecté : Abidjan, 02h14.", bg="red"),
   P("BUREAU DU MINISTRE — ABIDJAN", bg="amber"),
   L("Ibrahim Sow", "Ma petite, le deuil rend paranoïaque. Rentre à Dakar.", bg="amber"),
   L("Amara", "Elle m'a dit de ne faire confiance à personne. Y compris vous ?", bg="amber"),
   N("Un silence. Il ne sourit plus.", bg="red"),
   {"k": "end", "t": "À suivre…", "sub": "PARTIE 3 / 3", "d": 3.5, "bg": "dark"}]),
 "nova_ep01_partie3": ("NOVA · ÉP.1 « LA VEILLE » · 3/3", 66, [
   P("APPARTEMENT DE NADÈGE — COCODY", bg="teal"),
   N("La porte est entrouverte.", bg="teal"),
   L("Kofi", "Vous êtes la journaliste. Vous êtes en retard.", bg="teal"),
   L("Amara", "Et vous, vous êtes qui ?", bg="teal"),
   L("Kofi", "Celui qui sait lire ce que Nadège a caché.", bg="teal"),
   N("INDICE 01 : « Cherchez où l'on compte les billets avant qu'ils ne soient des chiffres. »", bg="amber"),
   P("TOIT D'ABIDJAN — NUIT", bg="red"),
   L("Le Courtier", "Ils ont trouvé la clé. Laissez-les courir. Ils nous mèneront aux autres.", bg="red"),
   {"k": "title", "t": "NOVA", "sub": "ÉPISODE 2 — BIENTÔT", "d": 4.5, "bg": "teal"}]),
 "nova_bande_annonce": ("NOVA · LA SÉRIE", 70, [
   N("Une PDG morte.", bg="teal", d=2.2), N("Une monnaie qui va changer l'Afrique.", bg="teal", d=3),
   N("Un secret qui peut faire tomber trois gouvernements.", bg="red", d=3.4),
   N("Elle a laissé 7 indices.", bg="amber", d=2.6), N("Qui est le Courtier ?", bg="red", d=2.6),
   {"k": "title", "t": "NOVA", "sub": "LA SÉRIE · BIENTÔT", "d": 4, "bg": "teal"}]),
}

if __name__ == "__main__":
    want = sys.argv[1:] or list(EP1)
    for k in want:
        tag, bpm, cards = EP1[k]; render(k, cards, tag, bpm)
